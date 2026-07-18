const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const c = require("../controllers/quizController");

const router = express.Router();

router.get("/", requireAuth, c.getDashboard);  // GET /api/dashboard

module.exports = router;