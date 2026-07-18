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
  getHistory,
  getDashboard,
};