# StudyWise Backend

Production-ready Node.js + Express + PostgreSQL API for the StudyWise
placement preparation platform.

## Stack

- Node.js / Express
- PostgreSQL via `pg`
- JWT auth (`jsonwebtoken`) + `bcrypt`
- `dotenv`, `cors`

## Setup

```bash
cd backend
cp .env.example .env      # then edit values
npm install
npm run dev               # or: npm start
```

## Health check

```
GET /api/health
→ { "status": "ok", "database": "connected", "server": "running" }
```

## Database schema

Apply the schema (one-time, on a fresh Postgres DB):

```bash
psql "$DATABASE_URL" -f db/schema.sql
# or with individual vars:
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f db/schema.sql
```

Tables: `users`, `quizzes`, `questions`, `quiz_attempts`, `answers`,
`recommendations`. All PKs are UUID (`gen_random_uuid()` via `pgcrypto`).
Indexes and foreign keys are defined in `db/schema.sql`.

Additional migrations:

```bash
psql "$DATABASE_URL" -f db/migrations/002_refresh_tokens.sql
```

## Auth API

| Method | Endpoint             | Auth | Description                          |
| ------ | -------------------- | ---- | ------------------------------------ |
| POST   | `/api/auth/signup`   |  –   | `{ name, email, password }` → tokens |
| POST   | `/api/auth/login`    |  –   | `{ email, password }` → tokens       |
| POST   | `/api/auth/refresh`  |  –   | `{ refreshToken }` → new tokens (rotated) |
| POST   | `/api/auth/logout`   |  –   | `{ refreshToken? }` → 204            |
| GET    | `/api/auth/me`       | JWT  | Current user profile                 |

Response shape for signup/login/refresh:

```json
{
  "status": "ok",
  "user": { "id": "...", "name": "...", "email": "...", "role": "user" },
  "accessToken": "<jwt>",
  "refreshToken": "<opaque>",
  "tokenType": "Bearer",
  "expiresIn": "15m"
}
```

Protect any route with the JWT middleware:

```js
const { requireAuth, requireRole } = require("./middleware/authMiddleware");
router.get("/private",       requireAuth,               handler);
router.get("/admin/metrics", requireAuth, requireRole("admin"), handler);
```

HTTP status codes used:
`200` OK · `201` Created · `204` No Content ·
`400` Validation · `401` Unauthenticated · `403` Forbidden ·
`404` Not Found · `409` Conflict · `500` Server Error.

## Quiz API

| Method | Endpoint                  | Auth | Description                                   |
| ------ | ------------------------- | ---- | --------------------------------------------- |
| GET    | `/api/quizzes`            |  –   | List published quizzes (`?subject&difficulty&limit&offset`) |
| GET    | `/api/quizzes/:id`        |  –   | Quiz + questions (correct answers hidden)     |
| POST   | `/api/quizzes`            | JWT  | Create quiz + questions in one call           |
| POST   | `/api/attempts`           | JWT  | Submit a full attempt; scored server-side     |
| GET    | `/api/history`            | JWT  | Current user's attempts                       |
| GET    | `/api/dashboard`          | JWT  | Aggregate stats per user & per subject        |

`POST /api/quizzes` body:
```json
{
  "title": "DSA Basics",
  "subject": "DSA",
  "difficulty": "medium",
  "durationMin": 15,
  "questions": [
    { "questionText": "...", "options": ["A","B","C","D"],
      "correctAnswer": "B", "explanation": "...", "topic": "Arrays", "marks": 1 }
  ]
}
```

`POST /api/attempts` body:
```json
{
  "quizId": "uuid",
  "timeTakenSec": 540,
  "answers": [
    { "questionId": "uuid", "selectedAnswer": "B", "timeTakenSec": 20 }
  ]
}
```

## AI API (OpenAI)

Set `OPENAI_API_KEY` in `.env` (never commit). Optionally set `OPENAI_MODEL`
(default `gpt-4o-mini`). All AI endpoints require JWT.

| Method | Endpoint                | Description                                  |
| ------ | ----------------------- | -------------------------------------------- |
| POST   | `/api/ai/generate-quiz` | `{ subject, difficulty?, count?, topic? }` → questions[] |
| POST   | `/api/ai/explain`       | `{ questionText, options, correctAnswer, selectedAnswer }` |
| POST   | `/api/ai/recommend`     | `{ subject, weakTopics?, score? }` → focus / roadmap / resources |

If `OPENAI_API_KEY` is missing the AI endpoints return `503`. The key is
read only server-side via `config/env.js` — never exposed to clients.

## Folder structure

```
backend/
├── config/         # env + db pool
├── controllers/    # request handlers
├── middleware/     # error handler, auth (add here)
├── models/         # SQL queries per entity
├── routes/         # express routers
├── services/       # business logic
├── utils/          # helpers (asyncHandler, ApiError, ...)
├── app.js          # express app (no listen)
├── server.js       # http bootstrap
├── package.json
└── .env.example
```