const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const c = require("../controllers/quizController");

const router = express.Router();

router.post("/",          requireAuth, c.submitAttempt);         // POST /api/attempts
router.post("/snapshot",  requireAuth, c.submitSnapshotAttempt); // POST /api/attempts/snapshot
router.get("/:id",        requireAuth, c.getAttempt);            // GET  /api/attempts/:id
router.delete("/:id",     requireAuth, c.deleteAttempt);         // DELETE /api/attempts/:id

module.exports = router;