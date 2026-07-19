/**
 * OAuth controller — Google + GitHub sign-in via raw OAuth 2.0.
 *
 * Flow:
 *   GET /api/auth/:provider          -> 302 to provider consent screen
 *   GET /api/auth/:provider/callback -> exchange code, resolve user,
 *                                       mint JWT + refresh, and 302 back
 *                                       to `${FRONTEND_URL}/oauth/callback`
 *                                       with the tokens as query params.
 *
 * Uses the SAME token-issuing helpers as the password login path so the
 * existing JWT / refresh-rotation architecture is preserved end-to-end.
 */
const crypto      = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const env         = require("../config/env");
const oauth       = require("../services/oauthService");
const refreshModel = require("../models/refreshTokenModel");
const {
  signAccessToken,
  generateRefreshToken,
} = require("../utils/tokens");

// --- Tiny in-process CSRF state store (5 min TTL). Single-worker only. ---
const STATE_TTL_MS = 5 * 60 * 1000;
const stateStore = new Map();
const putState = (state, provider) => {
  stateStore.set(state, { provider, exp: Date.now() + STATE_TTL_MS });
  if (stateStore.size > 500) {
    for (const [k, v] of stateStore) if (v.exp < Date.now()) stateStore.delete(k);
  }
};
const consumeState = (state, provider) => {
  const rec = stateStore.get(state);
  if (!rec) return false;
  stateStore.delete(state);
  return rec.provider === provider && rec.exp > Date.now();
};

const callbackUrl = (provider) =>
  `${env.oauth.callbackBaseUrl.replace(/\/$/, "")}/api/auth/${provider}/callback`;

const clientMeta = (req) => ({
  userAgent: (req.headers["user-agent"] || "").slice(0, 500) || null,
  ipAddress: (req.headers["x-forwarded-for"] || req.ip || "").toString().slice(0, 100) || null,
});

const issueTokensAndRedirect = async (res, user, req) => {
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
  const target = new URL("/oauth/callback", env.oauth.frontendUrl);
  target.searchParams.set("accessToken", accessToken);
  target.searchParams.set("refreshToken", raw);
  return res.redirect(target.toString());
};

const redirectWithError = (res, message) => {
  const target = new URL("/login", env.oauth.frontendUrl);
  target.searchParams.set("oauth_error", message);
  return res.redirect(target.toString());
};

// ============================ GOOGLE ============================
const googleStart = asyncHandler(async (req, res) => {
  if (!env.oauth.google.clientId || !env.oauth.google.clientSecret) {
    return redirectWithError(res, "Google sign-in is not configured on the server");
  }
  const state = crypto.randomBytes(24).toString("base64url");
  putState(state, "google");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.oauth.google.clientId);
  url.searchParams.set("redirect_uri", callbackUrl("google"));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");
  res.redirect(url.toString());
});

const googleCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query || {};
  if (error) return redirectWithError(res, String(error));
  if (!code || !state || !consumeState(state, "google")) {
    return redirectWithError(res, "Invalid or expired OAuth state");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: String(code),
      client_id: env.oauth.google.clientId,
      client_secret: env.oauth.google.clientSecret,
      redirect_uri: callbackUrl("google"),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return redirectWithError(res, "Google token exchange failed");
  const tokenBody = await tokenRes.json();
  if (!tokenBody.access_token) return redirectWithError(res, "Google returned no access token");

  const profRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenBody.access_token}` },
  });
  if (!profRes.ok) return redirectWithError(res, "Failed to fetch Google profile");
  const profile = await profRes.json();

  const user = await oauth.findOrCreateOAuthUser({
    provider: "google",
    providerId: profile.sub,
    email: profile.email,
    name: profile.name || profile.given_name,
    avatarUrl: profile.picture,
  });
  return issueTokensAndRedirect(res, user, req);
});

// ============================ GITHUB ============================
const githubStart = asyncHandler(async (req, res) => {
  if (!env.oauth.github.clientId || !env.oauth.github.clientSecret) {
    return redirectWithError(res, "GitHub sign-in is not configured on the server");
  }
  const state = crypto.randomBytes(24).toString("base64url");
  putState(state, "github");
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.oauth.github.clientId);
  url.searchParams.set("redirect_uri", callbackUrl("github"));
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);
  url.searchParams.set("allow_signup", "true");
  res.redirect(url.toString());
});

const githubCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query || {};
  if (error) return redirectWithError(res, String(error));
  if (!code || !state || !consumeState(state, "github")) {
    return redirectWithError(res, "Invalid or expired OAuth state");
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.oauth.github.clientId,
      client_secret: env.oauth.github.clientSecret,
      code: String(code),
      redirect_uri: callbackUrl("github"),
    }),
  });
  if (!tokenRes.ok) return redirectWithError(res, "GitHub token exchange failed");
  const tokenBody = await tokenRes.json();
  const accessToken = tokenBody.access_token;
  if (!accessToken) return redirectWithError(res, "GitHub returned no access token");

  const ghHeaders = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "StudyWise",
  };
  const [uRes, eRes] = await Promise.all([
    fetch("https://api.github.com/user",        { headers: ghHeaders }),
    fetch("https://api.github.com/user/emails", { headers: ghHeaders }),
  ]);
  if (!uRes.ok) return redirectWithError(res, "Failed to fetch GitHub profile");
  const profile = await uRes.json();

  let email = profile.email;
  if (!email && eRes.ok) {
    const emails = await eRes.json();
    if (Array.isArray(emails)) {
      const primary =
        emails.find((e) => e.primary && e.verified) ||
        emails.find((e) => e.verified) ||
        emails[0];
      if (primary) email = primary.email;
    }
  }

  const user = await oauth.findOrCreateOAuthUser({
    provider: "github",
    providerId: String(profile.id),
    email,
    name: profile.name || profile.login,
    avatarUrl: profile.avatar_url,
  });
  return issueTokensAndRedirect(res, user, req);
});

module.exports = {
  googleStart,
  googleCallback,
  githubStart,
  githubCallback,
};