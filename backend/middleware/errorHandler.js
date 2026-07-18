/**
 * Centralized error handler.
 * Any `next(err)` or thrown async error routes here.
 */
const env = require("../config/env");

// 404 handler — mounted after all routes.
const notFound = (req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const payload = {
    status: "error",
    message: err.message || "Internal Server Error",
  };

  if (env.nodeEnv !== "production") {
    payload.stack = err.stack;
  }

  // Log server-side; keep response clean.
  if (status >= 500) {
    console.error("[error]", err);
  }

  res.status(status).json(payload);
};

module.exports = { notFound, errorHandler };