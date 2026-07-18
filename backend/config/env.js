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
      String(process.env.PGSSL).toLowerCase() === "true"
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
};

module.exports = env;