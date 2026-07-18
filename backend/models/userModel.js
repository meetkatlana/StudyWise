/**
 * User model — raw pg queries.
 */
const { query } = require("../config/db");

const PUBLIC_COLS = `id, name, email, avatar_url, role, is_active, created_at, updated_at`;

const createUser = async ({ name, email, passwordHash, avatarUrl = null }) => {
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, avatar_url)
     VALUES ($1, LOWER($2), $3, $4)
     RETURNING ${PUBLIC_COLS}`,
    [name, email, passwordHash, avatarUrl]
  );
  return rows[0];
};

const findByEmail = async (email) => {
  const { rows } = await query(
    `SELECT id, name, email, password_hash, avatar_url, role, is_active, created_at, updated_at
     FROM users WHERE email = LOWER($1) LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLS} FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const updateProfile = async (id, { name, avatarUrl }) => {
  const { rows } = await query(
    `UPDATE users
       SET name       = COALESCE($2, name),
           avatar_url = COALESCE($3, avatar_url)
     WHERE id = $1
     RETURNING ${PUBLIC_COLS}`,
    [id, name ?? null, avatarUrl ?? null]
  );
  return rows[0] || null;
};

const deleteUser = async (id) => {
  await query(`DELETE FROM users WHERE id = $1`, [id]);
};

const getSettings = async (id) => {
  const { rows } = await query(
    `SELECT settings FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0]?.settings ?? {};
};

const updateSettings = async (id, settings) => {
  const { rows } = await query(
    `UPDATE users SET settings = $2::jsonb WHERE id = $1 RETURNING settings`,
    [id, JSON.stringify(settings ?? {})]
  );
  return rows[0]?.settings ?? {};
};

const updateEmail = async (id, email) => {
  const { rows } = await query(
    `UPDATE users SET email = LOWER($2) WHERE id = $1 RETURNING ${PUBLIC_COLS}`,
    [id, email]
  );
  return rows[0] || null;
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  updateProfile,
  updateEmail,
  deleteUser,
  getSettings,
  updateSettings,
};