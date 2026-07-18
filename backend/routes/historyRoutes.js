const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const c = require("../controllers/quizController");

const router = express.Router();

router.get("/",    requireAuth, c.getHistory);    // GET    /api/history
router.delete("/", requireAuth, c.clearHistory);  // DELETE /api/history

module.exports = router;