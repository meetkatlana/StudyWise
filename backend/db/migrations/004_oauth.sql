-- =====================================================================
-- Migration 004 — OAuth (Google / GitHub) sign-in.
--   * password_hash becomes nullable (OAuth users don't have a password).
--   * provider + provider_id columns identify social accounts.
--   * A composite unique index enforces at most one (provider, provider_id).
-- =====================================================================

ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS provider    VARCHAR(20)  NOT NULL DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_provider_identity
  ON users (provider, provider_id)
  WHERE provider_id IS NOT NULL;