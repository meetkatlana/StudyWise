/**
 * Question model — raw pg queries.
 * `options` and `correct_answer` are JSONB — pass JS arrays/strings; pg serializes.
 */
const { query, getClient } = require("../config/db");
const { refreshTotalQuestions } = require("./quizModel");

const addQuestion = async ({
  quizId,
  questionText,
  qType = "mcq",
  options,
  correctAnswer,
  explanation = null,
  topic = null,
  marks = 1,
  position = 0,
}) => {
  const { rows } = await query(
    `INSERT INTO questions
       (quiz_id, question_text, q_type, options, correct_answer, explanation, topic, marks, position)
     VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, $9)
     RETURNING *`,
    [
      quizId,
      questionText,
      qType,
      JSON.stringify(options),
      JSON.stringify(correctAnswer),
      explanation,
      topic,
      marks,
      position,
    ]
  );
  await refreshTotalQuestions(quizId);
  return rows[0];
};

/**
 * Bulk insert questions in a single transaction.
 */
const addQuestionsBulk = async (quizId, items = []) => {
  if (items.length === 0) return [];
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const inserted = [];
    for (let i = 0; i < items.length; i++) {
      const q = items[i];
      const { rows } = await client.query(
        `INSERT INTO questions
           (quiz_id, question_text, q_type, options, correct_answer, explanation, topic, marks, position)
         VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, $9)
         RETURNING *`,
        [
          quizId,
          q.questionText,
          q.qType || "mcq",
          JSON.stringify(q.options),
          JSON.stringify(q.correctAnswer),
          q.explanation || null,
          q.topic || null,
          q.marks || 1,
          q.position ?? i,
        ]
      );
      inserted.push(rows[0]);
    }
    await client.query(
      `UPDATE quizzes
         SET total_questions = (SELECT COUNT(*) FROM questions WHERE quiz_id = $1)
       WHERE id = $1`,
      [quizId]
    );
    await client.query("COMMIT");
    return inserted;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getQuestionsByQuiz = async (quizId, { includeAnswers = false } = {}) => {
  const cols = includeAnswers
    ? "*"
    : "id, quiz_id, question_text, q_type, options, topic, marks, position";
  const { rows } = await query(
    `SELECT ${cols} FROM questions WHERE quiz_id = $1 ORDER BY position ASC, created_at ASC`,
    [quizId]
  );
  return rows;
};

const getQuestionById = async (id) => {
  const { rows } = await query(`SELECT * FROM questions WHERE id = $1`, [id]);
  return rows[0] || null;
};

const deleteQuestion = async (id) => {
  await query(`DELETE FROM questions WHERE id = $1`, [id]);
};

module.exports = {
  addQuestion,
  addQuestionsBulk,
  getQuestionsByQuiz,
  getQuestionById,
  deleteQuestion,
};