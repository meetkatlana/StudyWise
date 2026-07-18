const asyncHandler = require("../utils/asyncHandler");
const db = require("../config/db");

/**
 * GET /api/health
 * Returns server + database status.
 */
const getHealth = asyncHandler(async (req, res) => {
  let databaseStatus = "disconnected";
  try {
    const ok = await db.ping();
    databaseStatus = ok ? "connected" : "disconnected";
  } catch (err) {
    databaseStatus = "disconnected";
  }

  res.status(200).json({
    status: "ok",
    database: databaseStatus,
    server: "running",
  });
});

module.exports = { getHealth };