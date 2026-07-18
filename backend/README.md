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