import type { QuizAttempt } from "./history-store";

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: string;
}

function daysBetween(a: Date, b: Date) {
  const ms = 24 * 60 * 60 * 1000;
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((da.getTime() - db.getTime()) / ms);
}

export function currentStreak(history: QuizAttempt[]): number {
  if (history.length === 0) return 0;
  const days = new Set(
    history.map((h) => new Date(h.createdAt).toDateString()),
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) streak++;
    else if (i > 0) break;
  }
  // If today has no entry but yesterday did, streak still starts from yesterday
  if (!days.has(today.toDateString()) && streak > 0) return streak;
  return streak;
}

export function totalQuestions(history: QuizAttempt[]): number {
  return history.reduce((acc, h) => acc + h.questions.length, 0);
}

export function averageAccuracy(history: QuizAttempt[]): number {
  if (history.length === 0) return 0;
  return Math.round(
    history.reduce((acc, h) => acc + h.accuracy, 0) / history.length,
  );
}

export function subjectAverages(history: QuizAttempt[]) {
  const map = new Map<string, { total: number; count: number }>();
  history.forEach((h) => {
    const cur = map.get(h.subject) ?? { total: 0, count: 0 };
    cur.total += h.accuracy;
    cur.count += 1;
    map.set(h.subject, cur);
  });
  return Array.from(map.entries()).map(([subject, s]) => ({
    subject,
    avg: Math.round(s.total / s.count),
    count: s.count,
  }));
}

export function bestAndWeakestSubjects(history: QuizAttempt[]) {
  const avgs = subjectAverages(history);
  if (avgs.length === 0) return { best: null, weakest: null };
  const sorted = [...avgs].sort((a, b) => b.avg - a.avg);
  return { best: sorted[0], weakest: sorted[sorted.length - 1] };
}

export function computeAchievements(history: QuizAttempt[]): Achievement[] {
  const total = history.length;
  const totalQs = totalQuestions(history);
  const streak = currentStreak(history);
  const bestAcc = history.reduce((m, h) => Math.max(m, h.accuracy), 0);
  const javaCount = history.filter((h) => h.subject === "Java").length;
  const sqlCount = history.filter((h) => h.subject === "SQL").length;

  return [
    {
      id: "beginner",
      emoji: "🏆",
      title: "Placement Beginner",
      description: "Complete your first quiz.",
      unlocked: total >= 1,
      progress: `${Math.min(total, 1)}/1 quiz`,
    },
    {
      id: "streak7",
      emoji: "🔥",
      title: "7 Day Streak",
      description: "Practice on 7 consecutive days.",
      unlocked: streak >= 7,
      progress: `${Math.min(streak, 7)}/7 days`,
    },
    {
      id: "acc90",
      emoji: "🎯",
      title: "Sharp Shooter",
      description: "Score 90% or higher in any quiz.",
      unlocked: bestAcc >= 90,
      progress: `Best: ${bestAcc}%`,
    },
    {
      id: "hundred",
      emoji: "💯",
      title: "Century Solver",
      description: "Solve 100 questions.",
      unlocked: totalQs >= 100,
      progress: `${Math.min(totalQs, 100)}/100`,
    },
    {
      id: "javaMaster",
      emoji: "⭐",
      title: "Java Master",
      description: "Complete 5 Java quizzes.",
      unlocked: javaCount >= 5,
      progress: `${Math.min(javaCount, 5)}/5`,
    },
    {
      id: "sqlExpert",
      emoji: "🔷",
      title: "SQL Expert",
      description: "Complete 3 SQL quizzes.",
      unlocked: sqlCount >= 3,
      progress: `${Math.min(sqlCount, 3)}/3`,
    },
  ];
}
