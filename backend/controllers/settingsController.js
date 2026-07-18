/**
 * User settings — GET / PUT the caller's JSONB settings blob.
 */
const asyncHandler = require("../utils/asyncHandler");
const userModel = require("../models/userModel");

const getSettings = asyncHandler(async (req, res) => {
  const settings = await userModel.getSettings(req.user.id);
  res.status(200).json({ status: "ok", settings });
});

const putSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body || {};
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return res.status(400).json({
      status: "error",
      message: "settings must be an object",
    });
  }
  const saved = await userModel.updateSettings(req.user.id, settings);
  res.status(200).json({ status: "ok", settings: saved });
});

module.exports = { getSettings, putSettings };