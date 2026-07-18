/**
 * Quiz service — orchestrates model calls for quiz endpoints.
 * Controllers stay thin; business logic lives here.
 */
const quizModel     = require("../models/quizModel");
const questionModel = require("../models/questionModel");
const attemptModel  = require("../models/attemptModel");
const answerModel   = require("../models/answerModel");
const ApiError      = require("../utils/ApiError");

// ---------- Quizzes ----------
const listQuizzes = (filters) => quizModel.listQuizzes(filters);

const getQuizWithQuestions = async (quizId) => {
  const quiz = await quizModel.getQuizById(quizId);
  if (!quiz) throw new ApiError(404, "Quiz not found");
  // Do NOT leak correct_answer in the public payload.
  const questions = await questionModel.getQuestionsByQuiz(quizId, {
    includeAnswers: false,
  });
  return { ...quiz, questions };
};

const createQuizWithQuestions = async ({
  createdBy,
  title,
  subject,
  description,
  difficulty,
  durationMin,
  questions = [],
}) => {
  if (!title || !subject) throw new ApiError(400, "title and subject are required");
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, "At least one question is required");
  }

  const quiz = await quizModel.createQuiz({
    title,
    subject,
    description,
    difficulty,
    durationMin,
    createdBy,
  });
  const inserted = await questionModel.addQuestionsBulk(quiz.id, questions);
  return { ...quiz, total_questions: inserted.length, questions: inserted };
};

// ---------- Attempts ----------
/**
 * Submit a full attempt in one call.
 * body: { quizId, timeTakenSec, answers: [{ questionId, selectedAnswer }] }
 * Scores server-side using the stored correct_answer.
 */
const submitAttempt = async ({ userId, quizId, timeTakenSec = 0, answers = [] }) => {
  if (!quizId) throw new ApiError(400, "quizId is required");
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new ApiError(400, "answers must be a non-empty array");
  }

  const quiz = await quizModel.getQuizById(quizId);
  if (!quiz) throw new ApiError(404, "Quiz not found");

  // Load correct answers once, index by id.
  const questions = await questionModel.getQuestionsByQuiz(quizId, {
    includeAnswers: true,
  });
  const qById = new Map(questions.map((q) => [q.id, q]));

  const attempt = await attemptModel.startAttempt({
    userId,
    quizId,
    totalCount: questions.length,
  });

  let correct = 0;
  for (const a of answers) {
    const q = qById.get(a.questionId);
    if (!q) continue;
    const isCorrect =
      JSON.stringify(a.selectedAnswer) === JSON.stringify(q.correct_answer);
    if (isCorrect) correct += 1;
    await answerModel.submitAnswer({
      attemptId: attempt.id,
      questionId: q.id,
      selectedAnswer: a.selectedAnswer ?? null,
      isCorrect,
      marksAwarded: isCorrect ? q.marks : 0,
      timeTakenSec: a.timeTakenSec || 0,
    });
  }

  const total = questions.length;
  const score = total > 0 ? +((correct / total) * 100).toFixed(2) : 0;
  const completed = await attemptModel.completeAttempt(attempt.id, {
    score,
    correctCount: correct,
    totalCount: total,
    timeTakenSec,
  });

  return { attempt: completed, score, correct, total };
};

/**
 * Persist a client-generated (snapshot) attempt — no server-side quiz row.
 * Body from the frontend already contains the questions, chosen answers,
 * and derived stats. Trust the server to re-derive counts to avoid tampering.
 */
const submitSnapshotAttempt = async ({
  userId,
  subject,
  difficulty,
  questions = [],
  answers = [],
  timeTakenSec = 0,
}) => {
  if (!subject || !difficulty) {
    throw new ApiError(400, "subject and difficulty are required");
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, "questions must be a non-empty array");
  }
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    throw new ApiError(400, "answers length must match questions length");
  }

  let correct = 0;
  for (let i = 0; i < questions.length; i += 1) {
    if (answers[i] !== null && answers[i] === questions[i]?.correctIndex) {
      correct += 1;
    }
  }
  const total = questions.length;
const score = total > 0 ? +((correct / total) * 100).toFixed(2) : 0;

const row = await attemptModel.insertSnapshotAttempt({
  userId,
  subject,
  difficulty: difficulty.toLowerCase(),
  totalCount: total,
  correctCount: correct,
  score,
  timeTakenSec,
  questionsSnapshot: questions,
  answersSnapshot: answers,
});

return toAttemptDTO(row);
};

// ---------- History / dashboard ----------
/**
 * Map a DB row into the shape the frontend consumes (matches the previous
 * localStorage-backed QuizAttempt object 1:1).
 */
const toAttemptDTO = (row) => {
  if (!row) return null;
  const answers    = Array.isArray(row.answers_snapshot)   ? row.answers_snapshot   : [];
  const questions  = Array.isArray(row.questions_snapshot) ? row.questions_snapshot : [];
  const total      = row.total_count ?? questions.length;
  const correct    = row.correct_count ?? 0;
  const answered   = answers.filter((a) => a !== null && a !== undefined).length;
  const accuracy   = total > 0 ? Math.round((correct / total) * 100) : 0;
  return {
    id: row.id,
    subject: row.subject || row.quiz_subject || "Unknown",
    difficulty: row.difficulty || "Medium",
    count: total,
    questions,
    answers,
    correctCount: correct,
    wrongCount: Math.max(0, answered - correct),
    accuracy,
    timeTakenSec: row.time_taken_sec || 0,
    createdAt: (row.completed_at || row.created_at)?.toISOString?.() ??
               row.completed_at ?? row.created_at,
  };
};

const getHistory = async (userId, opts) => {
  const rows = await attemptModel.listAttemptsByUser(userId, opts);
  return rows.map(toAttemptDTO);
};

const getAttemptForUser = async (userId, attemptId) => {
  const row = await attemptModel.getAttemptById(attemptId);
  if (!row || row.user_id !== userId) return null;
  return toAttemptDTO(row);
};

const deleteAttempt = (userId, attemptId) =>
  attemptModel.deleteAttempt(attemptId, userId);

const clearHistory = (userId) => attemptModel.deleteAllForUser(userId);

const getDashboard = async (userId) => {
  const attempts = await attemptModel.listAttemptsByUser(userId, { limit: 200 });
  const completed = attempts.filter((a) => a.status === "completed");

  const totalAttempts  = completed.length;
  const avgScore = totalAttempts
    ? +(
        completed.reduce((s, a) => s + Number(a.score || 0), 0) / totalAttempts
      ).toFixed(2)
    : 0;
  const bestScore = completed.reduce((m, a) => Math.max(m, Number(a.score || 0)), 0);
  const totalTimeSec = completed.reduce((s, a) => s + (a.time_taken_sec || 0), 0);

  // Per-subject aggregate
  const bySubject = {};
  for (const a of completed) {
    const key = a.quiz_subject || "Unknown";
    if (!bySubject[key]) bySubject[key] = { attempts: 0, totalScore: 0, best: 0 };
    bySubject[key].attempts   += 1;
    bySubject[key].totalScore += Number(a.score || 0);
    bySubject[key].best        = Math.max(bySubject[key].best, Number(a.score || 0));
  }
  const subjects = Object.entries(bySubject).map(([subject, v]) => ({
    subject,
    attempts: v.attempts,
    avgScore: +(v.totalScore / v.attempts).toFixed(2),
    bestScore: v.best,
  }));

  return {
    totals: { totalAttempts, avgScore, bestScore, totalTimeSec },
    subjects,
    recent: completed.slice(0, 5).map(toAttemptDTO),
  };
};

module.exports = {
  listQuizzes,
  getQuizWithQuestions,
  createQuizWithQuestions,
  submitAttempt,
  submitSnapshotAttempt,
  getHistory,
  getAttemptForUser,
  deleteAttempt,
  clearHistory,
  getDashboard,
};