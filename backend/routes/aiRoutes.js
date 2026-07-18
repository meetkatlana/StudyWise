const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const c = require("../controllers/aiController");

const router = express.Router();

// All AI endpoints require auth so the API key isn't burnt by anonymous callers.
router.post("/generate-quiz", requireAuth, c.generateQuiz);
router.post("/explain",       requireAuth, c.explainAnswer);
router.post("/recommend",     requireAuth, c.recommendTopics);

module.exports = router;