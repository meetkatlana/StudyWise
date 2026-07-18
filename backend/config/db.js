/**
 * PostgreSQL connection pool.
 * All queries in the app should go through `query` or `getClient`
 * so pool lifecycle stays centralized.
 */
const { Pool } = require("pg");
const env = require("./env");

const pool = new Pool(
  env.db.connectionString
    ? { connectionString: env.db.connectionString, ssl: env.db.ssl }
    : {
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        password: env.db.password,
        database: env.db.database,
        ssl: env.db.ssl,
      }
);

pool.on("error", (err) => {
  // Prevents the process from crashing on idle client errors.
  console.error("[pg] Unexpected idle client error:", err);
});

/**
 * Run a parameterized SQL query.
 * @param {string} text - SQL with $1, $2 placeholders
 * @param {Array}  [params]
 */
const query = (text, params) => pool.query(text, params);

/**
 * Checkout a client for transactions. Caller MUST release().
 */
const getClient = () => pool.connect();

/**
 * Lightweight ping used by the /health endpoint.
 */
const ping = async () => {
  const { rows } = await pool.query("SELECT 1 AS ok");
  return rows[0]?.ok === 1;
};

module.exports = { pool, query, getClient, ping };