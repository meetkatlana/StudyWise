const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const c = require("../controllers/quizController");

const router = express.Router();

router.post("/", requireAuth, c.submitAttempt);  // POST /api/attempts

module.exports = router;