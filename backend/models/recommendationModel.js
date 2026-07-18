/**
 * Recommendation model — raw pg queries.
 */
const { query } = require("../config/db");

const createRecommendation = async ({
  userId,
  attemptId = null,
  subject = null,
  weakTopics = [],
  strongTopics = [],
  roadmap = [],
  resources = [],
  notes = null,
}) => {
  const { rows } = await query(
    `INSERT INTO recommendations
       (user_id, attempt_id, subject, weak_topics, strong_topics, roadmap, resources, notes)
     VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8)
     RETURNING *`,
    [
      userId,
      attemptId,
      subject,
      JSON.stringify(weakTopics),
      JSON.stringify(strongTopics),
      JSON.stringify(roadmap),
      JSON.stringify(resources),
      notes,
    ]
  );
  return rows[0];
};

const getRecommendationById = async (id) => {
  const { rows } = await query(`SELECT * FROM recommendations WHERE id = $1`, [id]);
  return rows[0] || null;
};

const listRecommendationsByUser = async (userId, { limit = 20, offset = 0 } = {}) => {
  const { rows } = await query(
    `SELECT * FROM recommendations
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
};

const getLatestForAttempt = async (attemptId) => {
  const { rows } = await query(
    `SELECT * FROM recommendations
      WHERE attempt_id = $1
      ORDER BY created_at DESC LIMIT 1`,
    [attemptId]
  );
  return rows[0] || null;
};

const deleteRecommendation = async (id) => {
  await query(`DELETE FROM recommendations WHERE id = $1`, [id]);
};

module.exports = {
  createRecommendation,
  getRecommendationById,
  listRecommendationsByUser,
  getLatestForAttempt,
  deleteRecommendation,
};