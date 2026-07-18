/**
 * API router — mount all resource routers here.
 * Keeps app.js free of route-specific wiring.
 */
const express = require("express");
const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const quizRoutes      = require("./quizRoutes");
const attemptRoutes   = require("./attemptRoutes");
const historyRoutes   = require("./historyRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const aiRoutes        = require("./aiRoutes");
const settingsRoutes  = require("./settingsRoutes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth",   authRoutes);
router.use("/quizzes",   quizRoutes);
router.use("/attempts",  attemptRoutes);
router.use("/history",   historyRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/ai",        aiRoutes);
router.use("/settings",  settingsRoutes);

module.exports = router;