/**
 * Coach service — aggregates a user's entire quiz history into a
 * personalized study plan. All logic derived from attemptModel rows
 * (including snapshot questions/answers) — no extra queries.
 */
const attemptModel = require("../models/attemptModel");

const performanceLabel = (avg) => {
  if (avg >= 80) return "Excellent";
  if (avg >= 60) return "Good";
  if (avg >= 40) return "Average";
  return "Needs Improvement";
};

const noteFor = (avg) => {
  if (avg >= 80)
    return "Outstanding! You're placement-ready. Focus on advanced interview questions and timed mocks.";
  if (avg >= 60)
    return "Solid progress. Tighten your weak topics and add one mock test daily.";
  if (avg >= 40)
    return "You're on the right track. Strengthen fundamentals before harder quizzes.";
  return "Start with beginner revision and rebuild your foundation on core topics.";
};

const getCoachData = async (userId) => {
  const attempts = await attemptModel.listAttemptsByUser(userId, { limit: 500 });
  const completed = attempts.filter((a) => a.status === "completed");

  if (completed.length === 0) {
    return { empty: true };
  }

  const topicMap = new Map();      // topic -> {correct,total,subject}
  const subjectMap = new Map();    // subject -> {correct,total,attempts,totalScore}
  const difficultyMap = new Map(); // difficulty -> {correct,total}
  let totalScore = 0;

  for (const a of completed) {
    const qs = Array.isArray(a.questions_snapshot) ? a.questions_snapshot : [];
    const ans = Array.isArray(a.answers_snapshot) ? a.answers_snapshot : [];
    const subj = a.quiz_subject || a.subject || "Unknown";
    const diff = (a.difficulty || "medium").toLowerCase();
    totalScore += Number(a.score || 0);

    const s = subjectMap.get(subj) || { correct: 0, total: 0, attempts: 0, totalScore: 0 };
    s.attempts += 1;
    s.totalScore += Number(a.score || 0);

    const d = difficultyMap.get(diff) || { correct: 0, total: 0 };

    qs.forEach((q, i) => {
      const isCorrect = ans[i] !== null && ans[i] !== undefined && ans[i] === q.correctIndex;
      const t = q.topic || subj;
      const te = topicMap.get(t) || { correct: 0, total: 0, subject: subj };
      te.total += 1; if (isCorrect) te.correct += 1;
      topicMap.set(t, te);
      s.total += 1; if (isCorrect) s.correct += 1;
      d.total += 1; if (isCorrect) d.correct += 1;
    });

    subjectMap.set(subj, s);
    difficultyMap.set(diff, d);
  }

  const averageScore = +(totalScore / completed.length).toFixed(1);

  const topics = Array.from(topicMap.entries()).map(([topic, e]) => ({
    topic,
    accuracy: e.total ? Math.round((e.correct / e.total) * 100) : 0,
    subject: e.subject,
    attempted: e.total,
  }));

  const weakTopics = topics
    .filter((t) => t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const strongTopics = topics
    .filter((t) => t.accuracy >= 75)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  const primarySubject =
    Array.from(subjectMap.entries()).sort((a, b) => b[1].attempts - a[1].attempts)[0]?.[0] ||
    "General";

  // 7-day roadmap
  const seeds = weakTopics.length ? weakTopics.map((t) => t.topic) : [`${primarySubject} fundamentals`];
  const roadmap = [];
  for (let day = 1; day <= 7; day += 1) {
    if (day === 7) {
      roadmap.push({ day, title: `${primarySubject} full mock test`, duration: "60 min" });
    } else {
      const t = seeds[(day - 1) % seeds.length];
      roadmap.push({
        day,
        title: `Practice ${t}`,
        duration: day % 2 === 0 ? "45 min" : "30 min",
      });
    }
  }

  const focusSeeds = (weakTopics.length ? weakTopics : topics.slice(0, 3));

  const difficultyForPractice =
    averageScore >= 80 ? "Hard" : averageScore >= 50 ? "Medium" : "Easy";

  const videoUrlFor = (subject, topic) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${subject} ${topic}`.trim(),
    )}`;
  const notesUrlFor = (topic) =>
    `/notes/${encodeURIComponent(topic)}`;

  const recommendedPractice = focusSeeds.slice(0, 4).map((t) => ({
    title: `${t.topic} practice set`,
    subject: t.subject,
    topic: t.topic,
    difficulty: difficultyForPractice,
    practiceTopic: t.topic,
    practiceSubject: t.subject,
    practiceDifficulty: difficultyForPractice,
  }));

  const recommendedVideos = focusSeeds.slice(0, 4).map((t) => ({
    title: `${t.topic} — ${t.subject} tutorial`,
    subtitle: `${t.subject} · YouTube`,
    subject: t.subject,
    topic: t.topic,
    url: videoUrlFor(t.subject, t.topic),
    videoUrl: videoUrlFor(t.subject, t.topic),
  }));
  if (recommendedVideos.length === 0) {
    recommendedVideos.push({
      title: `${primarySubject} interview playlist`,
      subtitle: `${primarySubject} · YouTube`,
      subject: primarySubject,
      topic: primarySubject,
      url: videoUrlFor(primarySubject, "placement interview"),
      videoUrl: videoUrlFor(primarySubject, "placement interview"),
    });
  }

  const recommendedResources = focusSeeds.slice(0, 3).map((t) => ({
    title: `${t.topic} notes`,
    type: "Notes",
    subject: t.subject,
    topic: t.topic,
    notesUrl: notesUrlFor(t.topic),
    // No curated resource library yet — surface as "Coming soon" in UI.
    available: false,
  }));

  const subjectPerformance = Array.from(subjectMap.entries()).map(([subject, v]) => ({
    subject,
    attempts: v.attempts,
    avgScore: +(v.totalScore / v.attempts).toFixed(1),
    accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
  }));

  const difficultyPerformance = Array.from(difficultyMap.entries()).map(([difficulty, v]) => ({
    difficulty,
    accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    total: v.total,
  }));

  const recentTrend = completed.slice(0, 5).map((a) => ({
    date: a.completed_at?.toISOString?.() ?? a.completed_at ?? a.created_at,
    score: Number(a.score || 0),
    subject: a.quiz_subject || a.subject || "Unknown",
  }));

  return {
    empty: false,
    coachNote: noteFor(averageScore),
    overallPerformance: performanceLabel(averageScore),
    averageScore,
    totalAttempts: completed.length,
    subjectPerformance,
    difficultyPerformance,
    recentTrend,
    weakTopics: weakTopics.map((t) => ({
      topic: t.topic,
      accuracy: t.accuracy,
      subject: t.subject,
    })),
    strongTopics: strongTopics.map((t) => ({
      topic: t.topic,
      accuracy: t.accuracy,
      subject: t.subject,
    })),
    roadmap,
    recommendedPractice,
    recommendedVideos,
    recommendedResources,
  };
};

module.exports = { getCoachData };