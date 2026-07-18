/**
 * HTTP server bootstrap.
 * Loads env, verifies DB reachability, then starts listening.
 */
const app = require("./app");
const env = require("./config/env");
const db = require("./config/db");

const start = async () => {
  try {
    // Non-fatal probe — server still starts even if DB is down,
    // so /api/health can report the actual state.
    try {
      await db.ping();
      console.log("[db] Connected to PostgreSQL");
    } catch (err) {
      console.warn("[db] PostgreSQL not reachable at boot:", err.message);
    }

    const server = app.listen(env.port, () => {
      console.log(
        `[server] StudyWise API listening on http://localhost:${env.port} (${env.nodeEnv})`
      );
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n[server] Received ${signal}, shutting down...`);
      server.close(async () => {
        try {
          await db.pool.end();
        } catch (_) {
          /* noop */
        }
        process.exit(0);
      });
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("[server] Failed to start:", err);
    process.exit(1);
  }
};

start();