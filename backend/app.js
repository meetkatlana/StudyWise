/**
 * Express application setup.
 * Kept separate from server.js so it can be imported by tests
 * without starting an HTTP listener.
 */
const express = require("express");
const cors = require("cors");

const env = require("./config/env");
const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// ----- Global middleware -----
app.use(
  cors({
    origin:
      env.corsOrigin.includes("*") || env.corsOrigin.length === 0
        ? true
        : env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ----- Routes -----
app.use("/api", apiRoutes);

// Root ping for quick sanity checks.
app.get("/", (req, res) => {
  res.json({ name: "StudyWise API", status: "ok" });
});

// ----- Error handling (must be last) -----
app.use(notFound);
app.use(errorHandler);

module.exports = app;