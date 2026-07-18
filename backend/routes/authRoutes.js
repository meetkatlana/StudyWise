const express = require("express");
const {
  signup,
  login,
  refresh,
  logout,
  me,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup",  signup);
router.post("/login",   login);
router.post("/refresh", refresh);
router.post("/logout",  logout);
router.get("/me",       requireAuth, me);

module.exports = router;