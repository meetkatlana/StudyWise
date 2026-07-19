const express = require("express");
const {
  signup,
  login,
  refresh,
  logout,
  me,
} = require("../controllers/authController");
const {
  googleStart,
  googleCallback,
  githubStart,
  githubCallback,
} = require("../controllers/oauthController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup",  signup);
router.post("/login",   login);
router.post("/refresh", refresh);
router.post("/logout",  logout);
router.get("/me",       requireAuth, me);

// ------- OAuth 2.0 (Google + GitHub) -------
router.get("/google",           googleStart);
router.get("/google/callback",  googleCallback);
router.get("/github",           githubStart);
router.get("/github/callback",  githubCallback);

module.exports = router;