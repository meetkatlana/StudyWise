/**
 * Quiz attempt model — raw pg queries.
 */
const { query } = require("../config/db");

const startAttempt = async ({ userId, quizId, totalCount }) => {
  const { rows } = await query(
    `INSERT INTO quiz_attempts (user_id, quiz_id, total_count, status)
     VALUES ($1, $2, $3, 'in_progress')
     RETURNING *`,
    [userId, quizId, totalCount]
  );
  return rows[0];
};

/**
 * Persist a fully-scored, client-generated (snapshot) attempt in one insert.
 * quiz_id is NULL — the quiz was generated on the frontend and lives in
 * questions_snapshot / answers_snapshot.
 */
const insertSnapshotAttempt = async ({
  userId,
  subject,
  difficulty,
  totalCount,
  correctCount,
  score,
  timeTakenSec,
  questionsSnapshot,
  answersSnapshot,
}) => {
  console.log("Subject:", subject);
console.log("Difficulty:", difficulty);
  const { rows } = await query(
    `INSERT INTO quiz_attempts (
       user_id, quiz_id, subject, difficulty,
       score, correct_count, total_count, time_taken_sec,
       status, completed_at,
       questions_snapshot, answers_snapshot
     ) VALUES (
       $1, NULL, $2, $3,
       $4, $5, $6, $7,
       'completed', NOW(),
       $8::jsonb, $9::jsonb
     ) RETURNING *`,
    [
      userId,
      subject,
      difficulty,
      score,
      correctCount,
      totalCount,
      timeTakenSec,
      JSON.stringify(questionsSnapshot ?? []),
      JSON.stringify(answersSnapshot ?? []),
    ]
  );
  return rows[0];
};

const completeAttempt = async (
  attemptId,
  { score, correctCount, totalCount, timeTakenSec }
) => {
  const { rows } = await query(
    `UPDATE quiz_attempts
       SET score          = $2,
           correct_count  = $3,
           total_count    = $4,
           time_taken_sec = $5,
           status         = 'completed',
           completed_at   = NOW()
     WHERE id = $1
     RETURNING *`,
    [attemptId, score, correctCount, totalCount, timeTakenSec]
  );
  return rows[0] || null;
};

const getAttemptById = async (id) => {
  const { rows } = await query(
    `SELECT a.*, q.title AS quiz_title, COALESCE(q.subject, a.subject) AS quiz_subject
       FROM quiz_attempts a
       LEFT JOIN quizzes q ON q.id = a.quiz_id
      WHERE a.id = $1`,
    [id]
  );
  return rows[0] || null;
};

const listAttemptsByUser = async (userId, { limit = 50, offset = 0 } = {}) => {
  const { rows } = await query(
    `SELECT a.*, q.title AS quiz_title, COALESCE(q.subject, a.subject) AS quiz_subject
       FROM quiz_attempts a
       LEFT JOIN quizzes q ON q.id = a.quiz_id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
};

const deleteAttempt = async (id, userId) => {
  const { rowCount } = await query(
    `DELETE FROM quiz_attempts WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return rowCount > 0;
};

const deleteAllForUser = async (userId) => {
  const { rowCount } = await query(
    `DELETE FROM quiz_attempts WHERE user_id = $1`,
    [userId]
  );
  return rowCount;
};

module.exports = {
  startAttempt,
  insertSnapshotAttempt,
  completeAttempt,
  getAttemptById,
  listAttemptsByUser,
  deleteAttempt,
  deleteAllForUser,
};