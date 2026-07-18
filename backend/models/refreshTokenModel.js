/**
 * Refresh token model — raw pg queries.
 * Tokens are stored as sha256 hashes; raw values are only returned to the client once.
 */
const { query } = require("../config/db");

const storeRefreshToken = async ({
  userId,
  tokenHash,
  expiresAt,
  userAgent = null,
  ipAddress = null,
}) => {
  const { rows } = await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, expires_at, created_at`,
    [userId, tokenHash, expiresAt, userAgent, ipAddress]
  );
  return rows[0];
};

const findValidByHash = async (tokenHash) => {
  const { rows } = await query(
    `SELECT * FROM refresh_tokens
      WHERE token_hash = $1
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
};

const revokeByHash = async (tokenHash) => {
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`,
    [tokenHash]
  );
};

const revokeAllForUser = async (userId) => {
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW()
      WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
};

module.exports = {
  storeRefreshToken,
  findValidByHash,
  revokeByHash,
  revokeAllForUser,
};