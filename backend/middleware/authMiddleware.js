/**
 * Auth middleware.
 * Expects: Authorization: Bearer <access_token>
 * On success, attaches `req.user = { id, email, role }`.
 */
const { verifyAccessToken } = require("../utils/tokens");
const userModel = require("../models/userModel");

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res
        .status(401)
        .json({ status: "error", message: "Missing or malformed Authorization header" });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      const msg =
        err.name === "TokenExpiredError" ? "Access token expired" : "Invalid access token";
      return res.status(401).json({ status: "error", message: msg });
    }

    // Optional: confirm the user still exists / is active.
    const user = await userModel.findById(payload.sub);
    if (!user || !user.is_active) {
      return res
        .status(401)
        .json({ status: "error", message: "User no longer active" });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    return next();
  } catch (err) {
    return next(err);
  }
};

/**
 * Role gate — `requireRole('admin')`. Must be used after requireAuth.
 */
const requireRole = (...allowed) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Not authenticated" });
  }
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  next();
};

module.exports = { requireAuth, requireRole };