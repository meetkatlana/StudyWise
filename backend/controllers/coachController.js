/**
 * Coach controller — GET /api/coach
 * Returns a personalized study plan built from the caller's quiz history.
 */
const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/coachService");

const getCoach = asyncHandler(async (req, res) => {
  const data = await service.getCoachData(req.user.id);
  res.status(200).json({ status: "ok", coach: data });
});

module.exports = { getCoach };