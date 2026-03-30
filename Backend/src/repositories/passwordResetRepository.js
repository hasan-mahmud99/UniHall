const { initPool } = require("../../config/db");

async function getPool() {
  return initPool();
}

async function createPasswordResetToken({ userId, tokenHash, expiresAt }) {
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT INTO password_reset_tokens (userId, tokenHash, expiresAt, createdAt)
     VALUES (?, ?, ?, NOW())`,
    [userId, tokenHash, expiresAt]
  );
  return result.insertId;
}

async function findValidPasswordResetTokenByHash(tokenHash) {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT prt.id, prt.userId, prt.expiresAt, prt.usedAt
     FROM password_reset_tokens prt
     WHERE prt.tokenHash = ?
       AND prt.usedAt IS NULL
       AND prt.expiresAt > NOW()
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function markPasswordResetTokenUsed(id) {
  const pool = await getPool();
  await pool.query(
    `UPDATE password_reset_tokens SET usedAt = NOW() WHERE id = ?`,
    [id]
  );
}

module.exports = {
  createPasswordResetToken,
  findValidPasswordResetTokenByHash,
  markPasswordResetTokenUsed,
};
