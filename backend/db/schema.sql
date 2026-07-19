-- =====================================================================
-- StudyWise — PostgreSQL Schema
-- Raw SQL, no ORM. Uses UUID PKs, FKs, and indexes.
-- Run once against a fresh database:
--   psql "$DATABASE_URL" -f backend/db/schema.sql
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()

-- ---------- ENUMS ----------
DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE question_type AS ENUM ('mcq', 'multi', 'boolean');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'abandoned');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- USERS
-- =====================================================================
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  TEXT,                                 -- nullable: OAuth users have no password
  avatar_url     TEXT,
  provider       VARCHAR(20)  NOT NULL DEFAULT 'local',
  provider_id    VARCHAR(255),
  role           VARCHAR(20)  NOT NULL DEFAULT 'user',
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email      ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_provider_identity
  ON users (provider, provider_id)
  WHERE provider_id IS NOT NULL;

-- =====================================================================
-- QUIZZES  (a quiz template: subject + difficulty + question set)
-- =====================================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          VARCHAR(200) NOT NULL,
  subject        VARCHAR(80)  NOT NULL,
  description    TEXT,
  difficulty     difficulty_level NOT NULL DEFAULT 'medium',
  duration_min   INTEGER      NOT NULL DEFAULT 15 CHECK (duration_min > 0),
  total_questions INTEGER     NOT NULL DEFAULT 0 CHECK (total_questions >= 0),
  created_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  is_published   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject    ON quizzes (subject);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON quizzes (difficulty);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes (created_by);

-- =====================================================================
-- QUESTIONS  (options + correct answer stored inline as JSONB)
--   options        : ["A", "B", "C", "D"]
--   correct_answer : "B"  (or ["A","C"] for multi-select)
-- =====================================================================
CREATE TABLE IF NOT EXISTS questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id        UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  q_type         question_type NOT NULL DEFAULT 'mcq',
  options        JSONB NOT NULL,
  correct_answer JSONB NOT NULL,
  explanation    TEXT,
  topic          VARCHAR(120),
  marks          INTEGER NOT NULL DEFAULT 1 CHECK (marks > 0),
  position       INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id  ON questions (quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic    ON questions (topic);
CREATE INDEX IF NOT EXISTS idx_questions_position ON questions (quiz_id, position);

-- =====================================================================
-- QUIZ ATTEMPTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  quiz_id        UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score          NUMERIC(6,2) NOT NULL DEFAULT 0,   -- percentage 0-100
  correct_count  INTEGER      NOT NULL DEFAULT 0,
  total_count    INTEGER      NOT NULL DEFAULT 0,
  time_taken_sec INTEGER      NOT NULL DEFAULT 0,
  status         attempt_status NOT NULL DEFAULT 'in_progress',
  started_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id      ON quiz_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz_id      ON quiz_attempts (quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_quiz    ON quiz_attempts (user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_completed_at ON quiz_attempts (completed_at DESC);

-- =====================================================================
-- ANSWERS  (one row per question inside an attempt)
-- =====================================================================
CREATE TABLE IF NOT EXISTS answers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id          UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id         UUID NOT NULL REFERENCES questions(id)     ON DELETE CASCADE,
  selected_answer     JSONB,               -- "B" or ["A","C"] or null if skipped
  is_correct          BOOLEAN NOT NULL DEFAULT FALSE,
  marks_awarded       NUMERIC(6,2) NOT NULL DEFAULT 0,
  time_taken_sec      INTEGER NOT NULL DEFAULT 0,
  answered_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_answers_attempt_id  ON answers (attempt_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers (question_id);

-- =====================================================================
-- RECOMMENDATIONS  (AI-generated study guidance per user)
-- =====================================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
  attempt_id     UUID          REFERENCES quiz_attempts(id) ON DELETE SET NULL,
  subject        VARCHAR(80),
  weak_topics    JSONB   NOT NULL DEFAULT '[]'::JSONB,   -- ["Arrays","Trees"]
  strong_topics  JSONB   NOT NULL DEFAULT '[]'::JSONB,
  roadmap        JSONB   NOT NULL DEFAULT '[]'::JSONB,   -- 7-day plan
  resources      JSONB   NOT NULL DEFAULT '[]'::JSONB,   -- videos/articles
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reco_user_id    ON recommendations (user_id);
CREATE INDEX IF NOT EXISTS idx_reco_attempt_id ON recommendations (attempt_id);
CREATE INDEX IF NOT EXISTS idx_reco_created_at ON recommendations (created_at DESC);

-- =====================================================================
-- updated_at auto-touch trigger
-- =====================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at   ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_quizzes_updated_at ON quizzes;
CREATE TRIGGER trg_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();