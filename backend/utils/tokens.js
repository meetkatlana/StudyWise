/**
 * JWT + refresh-token helpers.
 * Access token  : short-lived JWT signed with JWT_SECRET
 * Refresh token : long-lived opaque random string (sha256 hash stored in DB)
 */
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const ACCESS_EXPIRES_IN  = env.jwt.expiresIn || "15m";
const REFRESH_TTL_MS     = 30 * 24 * 60 * 60 * 1000; // 30 days

const signAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email, role: user.role || "user" },
    env.jwt.secret,
    { expiresIn: ACCESS_EXPIRES_IN }
  );

const verifyAccessToken = (token) => jwt.verify(token, env.jwt.secret);

const generateRefreshToken = () => {
  const raw = crypto.randomBytes(48).toString("base64url");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  return { raw, hash, expiresAt };
};

const hashRefreshToken = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  ACCESS_EXPIRES_IN,
  REFRESH_TTL_MS,
};