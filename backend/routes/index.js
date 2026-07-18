/**
 * API router — mount all resource routers here.
 * Keeps app.js free of route-specific wiring.
 */
const express = require("express");
const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth",   authRoutes);

module.exports = router;