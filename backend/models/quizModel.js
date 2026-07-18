/**
 * Quiz model — raw pg queries.
 */
const { query } = require("../config/db");

const createQuiz = async ({
  title,
  subject,
  description = null,
  difficulty = "medium",
  durationMin = 15,
  createdBy = null,
}) => {
  const { rows } = await query(
    `INSERT INTO quizzes (title, subject, description, difficulty, duration_min, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, subject, description, difficulty, durationMin, createdBy]
  );
  return rows[0];
};

const getQuizById = async (id) => {
  const { rows } = await query(`SELECT * FROM quizzes WHERE id = $1`, [id]);
  return rows[0] || null;
};

const listQuizzes = async ({ subject, difficulty, limit = 50, offset = 0 } = {}) => {
  const clauses = ["is_published = TRUE"];
  const params = [];
  if (subject) {
    params.push(subject);
    clauses.push(`subject = $${params.length}`);
  }
  if (difficulty) {
    params.push(difficulty);
    clauses.push(`difficulty = $${params.length}`);
  }
  params.push(limit, offset);
  const { rows } = await query(
    `SELECT * FROM quizzes
     WHERE ${clauses.join(" AND ")}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
};

const refreshTotalQuestions = async (quizId) => {
  await query(
    `UPDATE quizzes
       SET total_questions = (SELECT COUNT(*) FROM questions WHERE quiz_id = $1)
     WHERE id = $1`,
    [quizId]
  );
};

const deleteQuiz = async (id) => {
  await query(`DELETE FROM quizzes WHERE id = $1`, [id]);
};

module.exports = {
  createQuiz,
  getQuizById,
  listQuizzes,
  refreshTotalQuestions,
  deleteQuiz,
};