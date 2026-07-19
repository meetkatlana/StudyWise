const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const c = require("../controllers/coachController");

const router = express.Router();

router.get("/", requireAuth, c.getCoach);

module.exports = router;