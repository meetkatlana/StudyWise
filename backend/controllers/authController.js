/**
 * Auth controller — signup / login / refresh / logout / me.
 * Password hashing: bcrypt. Access token: JWT. Refresh: opaque + DB-stored hash.
 */
const bcrypt = require("bcrypt");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");
const userModel = require("../models/userModel");
const refreshModel = require("../models/refreshTokenModel");
const {
  isValidEmail,
  validatePassword,
  validateName,
} = require("../utils/validators");
const {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  ACCESS_EXPIRES_IN,
} = require("../utils/tokens");

const clientMeta = (req) => ({
  userAgent: (req.headers["user-agent"] || "").slice(0, 500) || null,
  ipAddress: (req.headers["x-forwarded-for"] || req.ip || "").toString().slice(0, 100) || null,
});

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatar_url: u.avatar_url,
  role: u.role,
  created_at: u.created_at,
});

const issueTokens = async (user, req) => {
  const accessToken = signAccessToken(user);
  const { raw, hash, expiresAt } = generateRefreshToken();
  const meta = clientMeta(req);
  await refreshModel.storeRefreshToken({
    userId: user.id,
    tokenHash: hash,
    expiresAt,
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });
  return {
    accessToken,
    refreshToken: raw,
    tokenType: "Bearer",
    expiresIn: ACCESS_EXPIRES_IN,
  };
};

// POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  const nameErr = validateName(name);
  if (nameErr) throw new ApiError(400, nameErr);
  if (!isValidEmail(email)) throw new ApiError(400, "Invalid email address");
  const pwErr = validatePassword(password);
  if (pwErr) throw new ApiError(400, pwErr);

  const existing = await userModel.findByEmail(email);
  if (existing) throw new ApiError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(password, env.bcrypt.saltRounds);
  const user = await userModel.createUser({
    name: name.trim(),
    email: email.trim(),
    passwordHash,
  });

  const tokens = await issueTokens(user, req);
  res.status(201).json({ status: "ok", user: publicUser(user), ...tokens });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!isValidEmail(email) || typeof password !== "string" || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await userModel.findByEmail(email);
  // Uniform error to avoid user enumeration.
  if (!user || !user.is_active) throw new ApiError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  const tokens = await issueTokens(user, req);
  res.status(200).json({ status: "ok", user: publicUser(user), ...tokens });
});

// POST /api/auth/refresh   body: { refreshToken }
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  if (typeof refreshToken !== "string" || !refreshToken) {
    throw new ApiError(400, "refreshToken is required");
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const record = await refreshModel.findValidByHash(tokenHash);
  if (!record) throw new ApiError(401, "Invalid or expired refresh token");

  const user = await userModel.findById(record.user_id);
  if (!user || !user.is_active) {
    await refreshModel.revokeByHash(tokenHash);
    throw new ApiError(401, "User no longer active");
  }

  // Rotate: revoke old, issue new pair.
  await refreshModel.revokeByHash(tokenHash);
  const tokens = await issueTokens(user, req);
  res.status(200).json({ status: "ok", user: publicUser(user), ...tokens });
});

// POST /api/auth/logout   body: { refreshToken? }
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  if (typeof refreshToken === "string" && refreshToken) {
    await refreshModel.revokeByHash(hashRefreshToken(refreshToken));
  }
  res.status(204).send();
});

// GET /api/auth/me   (protected)
const me = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json({ status: "ok", user: publicUser(user) });
});

module.exports = { signup, login, refresh, logout, me };