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