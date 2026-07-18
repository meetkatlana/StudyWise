const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const c = require("../controllers/quizController");

const router = express.Router();

router.get("/",     c.listQuizzes);              // GET  /api/quizzes
router.get("/:id",  c.getQuiz);                  // GET  /api/quizzes/:id
router.post("/",    requireAuth, c.createQuiz);  // POST /api/quizzes

module.exports = router;