/**
 * Centralized environment configuration.
 * Loads .env once and exposes typed, validated values.
 */
require("dotenv").config();

const required = (key, fallback) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),

  corsOrigin: (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  db: {
    connectionString: process.env.DATABASE_URL || undefined,
    host: process.env.PGHOST || "localhost",
    port: parseInt(process.env.PGPORT || "5432", 10),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "",
    database: process.env.PGDATABASE || "studywise",
    ssl:
  process.env.PGSSL === "true" ||
  process.env.PGSSLMODE === "require"
    ? { rejectUnauthorized: false }
    : false,
  },

  jwt: {
    secret: required("JWT_SECRET", "dev_insecure_secret_change_me"),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    model:  process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
  
  oauth: {
    // Where to send the user AFTER OAuth completes (frontend origin).
    frontendUrl:
      process.env.FRONTEND_URL ||
      (process.env.CORS_ORIGIN || "http://localhost:5173").split(",")[0].trim(),
    // Base URL the OAuth provider redirects back to (this backend, publicly reachable).
    callbackBaseUrl:
      process.env.OAUTH_CALLBACK_BASE_URL ||
      `http://localhost:${parseInt(process.env.PORT || "5000", 10)}`,
    google: {
      clientId:     process.env.GOOGLE_CLIENT_ID     || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId:     process.env.GITHUB_CLIENT_ID     || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
};
console.log("OAUTH_CALLBACK_BASE_URL =", process.env.OAUTH_CALLBACK_BASE_URL);
console.log("callbackBaseUrl =", env.oauth.callbackBaseUrl);
module.exports = env;