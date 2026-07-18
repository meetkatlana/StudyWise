const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const c = require("../controllers/settingsController");

const router = express.Router();

router.get("/",  requireAuth, c.getSettings);
router.put("/",  requireAuth, c.putSettings);

module.exports = router;