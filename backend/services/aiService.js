/**
 * AI service — wraps OpenAI for quiz-related generation tasks.
 * All prompts, JSON shaping, and error handling live here so
 * controllers only deal with clean data.
 *
 * API key is read from process.env.OPENAI_API_KEY (via config/env).
 */
const OpenAI = require("openai");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

let _client;
const getClient = () => {
  if (!env.openai.apiKey) {
    throw new ApiError(503, "AI service not configured (OPENAI_API_KEY missing)");
  }
  if (!_client) _client = new OpenAI({ apiKey: env.openai.apiKey });
  return _client;
};

/**
 * Ask the model for a JSON object. Parses and returns it.
 */
const chatJson = async (system, user) => {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: env.openai.model,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user",   content: user },
    ],
  });
  const raw = completion.choices?.[0]?.message?.content || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(502, "AI returned invalid JSON");
  }
};

/**
 * Generate a set of quiz questions.
 *
 * @param {Object} opts
 * @param {string} opts.subject
 * @param {'easy'|'medium'|'hard'} [opts.difficulty]
 * @param {number} [opts.count]
 * @param {string} [opts.topic]
 * @returns {Promise<Array<{questionText,options,correctAnswer,explanation,topic}>>}
 */
const generateQuiz = async ({ subject, difficulty = "medium", count = 5, topic = null }) => {
  const system =
    "You are an expert placement-prep tutor. Generate high-quality MCQ questions. " +
    "Return ONLY JSON matching the requested shape. No markdown, no commentary.";

  const user = `
Create ${count} multiple-choice questions for the subject "${subject}"${topic ? ` focusing on the topic "${topic}"` : ""}.
Difficulty: ${difficulty}.

Return JSON of the exact shape:
{
  "questions": [
    {
      "questionText": "string",
      "options": ["A","B","C","D"],
      "correctAnswer": "A" | "B" | "C" | "D",
      "explanation": "short reason (1-3 sentences)",
      "topic": "sub-topic label"
    }
  ]
}`;

  const data = await chatJson(system, user);
  if (!Array.isArray(data.questions)) {
    throw new ApiError(502, "AI response missing 'questions' array");
  }
  return data.questions;
};

/**
 * Explain why an answer is correct or incorrect.
 */
const explainAnswer = async ({ questionText, options, correctAnswer, selectedAnswer }) => {
  const system =
    "You are a patient tutor. Explain clearly and concisely (max 4 sentences). Return JSON only.";
  const user = `
Question: ${questionText}
Options: ${JSON.stringify(options)}
Correct answer: ${JSON.stringify(correctAnswer)}
Student's answer: ${JSON.stringify(selectedAnswer)}

Return JSON:
{
  "isCorrect": boolean,
  "explanation": "string",
  "keyConcept": "one short phrase"
}`;
  return chatJson(system, user);
};

/**
 * Recommend topics to study based on weak areas.
 *
 * @param {Object} opts
 * @param {string} opts.subject
 * @param {string[]} opts.weakTopics
 * @param {number} [opts.score] percentage
 */
const recommendTopics = async ({ subject, weakTopics = [], score = null }) => {
  const system =
    "You are a placement-prep coach. Recommend a focused study plan. Return JSON only.";
  const user = `
Subject: ${subject}
Overall score: ${score === null ? "unknown" : `${score}%`}
Weak topics: ${JSON.stringify(weakTopics)}

Return JSON:
{
  "focusTopics": ["string"],
  "roadmap": [
    { "day": 1, "topic": "string", "task": "string" }
  ],
  "resources": [
    { "title": "string", "type": "video|article|practice", "why": "string" }
  ],
  "notes": "1-2 sentences of encouragement + strategy"
}`;
  return chatJson(system, user);
};

module.exports = { generateQuiz, explainAnswer, recommendTopics };