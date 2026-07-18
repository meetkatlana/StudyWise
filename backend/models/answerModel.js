/**
 * Answer model — raw pg queries.
 * ON CONFLICT allows resubmitting an answer during an in-progress attempt.
 */
const { query } = require("../config/db");

const submitAnswer = async ({
  attemptId,
  questionId,
  selectedAnswer,
  isCorrect,
  marksAwarded = 0,
  timeTakenSec = 0,
}) => {
  const { rows } = await query(
    `INSERT INTO answers
       (attempt_id, question_id, selected_answer, is_correct, marks_awarded, time_taken_sec)
     VALUES ($1, $2, $3::jsonb, $4, $5, $6)
     ON CONFLICT (attempt_id, question_id) DO UPDATE
       SET selected_answer = EXCLUDED.selected_answer,
           is_correct      = EXCLUDED.is_correct,
           marks_awarded   = EXCLUDED.marks_awarded,
           time_taken_sec  = EXCLUDED.time_taken_sec,
           answered_at     = NOW()
     RETURNING *`,
    [
      attemptId,
      questionId,
      selectedAnswer === null || selectedAnswer === undefined
        ? null
        : JSON.stringify(selectedAnswer),
      isCorrect,
      marksAwarded,
      timeTakenSec,
    ]
  );
  return rows[0];
};

const getAnswersByAttempt = async (attemptId) => {
  const { rows } = await query(
    `SELECT a.*, q.question_text, q.options, q.correct_answer, q.explanation, q.topic
       FROM answers a
       JOIN questions q ON q.id = a.question_id
      WHERE a.attempt_id = $1
      ORDER BY q.position ASC`,
    [attemptId]
  );
  return rows;
};

module.exports = { submitAnswer, getAnswersByAttempt };