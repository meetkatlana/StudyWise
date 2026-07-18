-- =====================================================================
-- Migration 003
--   1. Allow quiz_attempts to store client-generated (snapshot) quizzes
--      by relaxing the FK and adding subject / difficulty / snapshot cols.
--   2. Add a per-user JSONB settings column.
-- =====================================================================

ALTER TABLE quiz_attempts
  ALTER COLUMN quiz_id DROP NOT NULL;

ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS subject            VARCHAR(80),
  ADD COLUMN IF NOT EXISTS difficulty         difficulty_level,
  ADD COLUMN IF NOT EXISTS questions_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS answers_snapshot   JSONB;

CREATE INDEX IF NOT EXISTS idx_attempts_subject ON quiz_attempts (subject);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::JSONB;