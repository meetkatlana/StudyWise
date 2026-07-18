/**
 * Quiz + attempts + history + dashboard controllers.
 * Thin wrappers around quizService.
 */
const asyncHandler = require("../utils/asyncHandler");
const ApiError     = require("../utils/ApiError");
const service      = require("../services/quizService");

// GET /api/quizzes
const listQuizzes = asyncHandler(async (req, res) => {
  const { subject, difficulty, limit, offset } = req.query;
  const rows = await service.listQuizzes({
    subject,
    difficulty,
    limit:  limit  ? Math.min(parseInt(limit, 10), 100) : 50,
    offset: offset ? parseInt(offset, 10) : 0,
  });
  res.status(200).json({ status: "ok", count: rows.length, quizzes: rows });
});

// GET /api/quizzes/:id
const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await service.getQuizWithQuestions(req.params.id);
  res.status(200).json({ status: "ok", quiz });
});

// POST /api/quizzes   (auth required)
const createQuiz = asyncHandler(async (req, res) => {
  const { title, subject, description, difficulty, durationMin, questions } = req.body || {};
  const quiz = await service.createQuizWithQuestions({
    createdBy: req.user.id,
    title,
    subject,
    description,
    difficulty,
    durationMin,
    questions,
  });
  res.status(201).json({ status: "ok", quiz });
});

// POST /api/attempts   (auth required)
const submitAttempt = asyncHandler(async (req, res) => {
  const { quizId, timeTakenSec, answers } = req.body || {};
  const result = await service.submitAttempt({
    userId: req.user.id,
    quizId,
    timeTakenSec,
    answers,
  });
  res.status(201).json({ status: "ok", ...result });
});

// POST /api/attempts/snapshot   (auth required)
// Persist a client-generated quiz (no server-side quiz row required).
const submitSnapshotAttempt = asyncHandler(async (req, res) => {
  const { subject, difficulty, questions, answers, timeTakenSec } = req.body || {};
  const attempt = await service.submitSnapshotAttempt({
    userId: req.user.id,
    subject,
    difficulty,
    questions,
    answers,
    timeTakenSec,
  });
  res.status(201).json({ status: "ok", attempt });
});

// GET /api/attempts/:id   (auth required)
const getAttempt = asyncHandler(async (req, res) => {
  const attempt = await service.getAttemptForUser(req.user.id, req.params.id);
  if (!attempt) return res.status(404).json({ status: "error", message: "Attempt not found" });
  res.status(200).json({ status: "ok", attempt });
});

// DELETE /api/attempts/:id   (auth required)
const deleteAttempt = asyncHandler(async (req, res) => {
  const ok = await service.deleteAttempt(req.user.id, req.params.id);
  if (!ok) return res.status(404).json({ status: "error", message: "Attempt not found" });
  res.status(204).send();
});

// DELETE /api/history   (auth required)
const clearHistory = asyncHandler(async (req, res) => {
  const removed = await service.clearHistory(req.user.id);
  res.status(200).json({ status: "ok", removed });
});

// GET /api/history   (auth required)
const getHistory = asyncHandler(async (req, res) => {
  const { limit, offset } = req.query;
  const rows = await service.getHistory(req.user.id, {
    limit:  limit  ? Math.min(parseInt(limit, 10), 100) : 50,
    offset: offset ? parseInt(offset, 10) : 0,
  });
  res.status(200).json({ status: "ok", count: rows.length, attempts: rows });
});

// GET /api/dashboard   (auth required)
const getDashboard = asyncHandler(async (req, res) => {
  const data = await service.getDashboard(req.user.id);
  res.status(200).json({ status: "ok", dashboard: data });
});

module.exports = {
  listQuizzes,
  getQuiz,
  createQuiz,
  submitAttempt,
  submitSnapshotAttempt,
  getAttempt,
  deleteAttempt,
  clearHistory,
  getHistory,
  getDashboard,
};