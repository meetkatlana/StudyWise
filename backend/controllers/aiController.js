/**
 * AI controller — thin HTTP layer over services/aiService.
 */
const asyncHandler = require("../utils/asyncHandler");
const ApiError     = require("../utils/ApiError");
const ai           = require("../services/aiService");

// POST /api/ai/generate-quiz
// body: { subject, difficulty?, count?, topic? }
const generateQuiz = asyncHandler(async (req, res) => {
  const { subject, difficulty, count, topic } = req.body || {};
  if (!subject) throw new ApiError(400, "subject is required");
  const n = count ? Math.min(Math.max(parseInt(count, 10), 1), 20) : 5;
  const questions = await ai.generateQuiz({ subject, difficulty, count: n, topic });
  res.status(200).json({ status: "ok", subject, difficulty: difficulty || "medium", count: questions.length, questions });
});

// POST /api/ai/explain
// body: { questionText, options, correctAnswer, selectedAnswer }
const explainAnswer = asyncHandler(async (req, res) => {
  const { questionText, options, correctAnswer, selectedAnswer } = req.body || {};
  if (!questionText || !Array.isArray(options) || correctAnswer === undefined) {
    throw new ApiError(400, "questionText, options[], and correctAnswer are required");
  }
  const data = await ai.explainAnswer({ questionText, options, correctAnswer, selectedAnswer });
  res.status(200).json({ status: "ok", ...data });
});

// POST /api/ai/recommend
// body: { subject, weakTopics?, score? }
const recommendTopics = asyncHandler(async (req, res) => {
  const { subject, weakTopics = [], score = null } = req.body || {};
  if (!subject) throw new ApiError(400, "subject is required");
  const data = await ai.recommendTopics({ subject, weakTopics, score });
  res.status(200).json({ status: "ok", subject, ...data });
});

module.exports = { generateQuiz, explainAnswer, recommendTopics };