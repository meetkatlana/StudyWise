-- =====================================================================
-- Migration 005 — Unify users schema for password + OAuth auth.
--
-- Safe to run against ANY prior state of the users table:
--   * legacy DB with a `password` column and no OAuth fields
--   * DB already migrated by 004_oauth.sql
--   * fresh DB created from schema.sql
--
-- Actions (all idempotent):
--   1. Ensure `avatar_url` column exists.
--   2. Ensure `password_hash` exists; if only legacy `password` exists,
--      rename it. If both exist, backfill nulls from `password` then
--      drop the legacy column. Preserves all existing user rows.
--   3. Make `password_hash` nullable (OAuth users have no password).
--   4. Ensure `provider` (default 'local', NOT NULL) and `provider_id`.
--   5. Ensure composite unique index on (provider, provider_id).
-- =====================================================================

-- 1) avatar_url
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2) password  ->  password_hash (preserve data)
DO $$
DECLARE
  has_password      BOOLEAN;
  has_password_hash BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password'
  ) INTO has_password;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash'
  ) INTO has_password_hash;

  IF has_password AND NOT has_password_hash THEN
    EXECUTE 'ALTER TABLE users RENAME COLUMN password TO password_hash';
  ELSIF has_password AND has_password_hash THEN
    EXECUTE 'UPDATE users SET password_hash = password WHERE password_hash IS NULL AND password IS NOT NULL';
    EXECUTE 'ALTER TABLE users DROP COLUMN password';
  ELSIF NOT has_password AND NOT has_password_hash THEN
    EXECUTE 'ALTER TABLE users ADD COLUMN password_hash TEXT';
  END IF;
END $$;

-- 3) password_hash nullable (OAuth users)
ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;

-- 4) provider + provider_id
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS provider    VARCHAR(20) NOT NULL DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);

-- Backfill any pre-existing NULL providers (defensive; DEFAULT handles new rows).
UPDATE users SET provider = 'local' WHERE provider IS NULL;

-- 5) unique (provider, provider_id) where provider_id present
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_provider_identity
  ON users (provider, provider_id)
  WHERE provider_id IS NOT NULL;