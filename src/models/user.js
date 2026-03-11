// src/models/user.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

async function createUser({
  username,
  password,
  role = "resident",
  real_name = null,
}) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const [result] = await db.execute(
    `INSERT INTO users (username, password_hash, role, real_name, created_at) VALUES (?, ?, ?, ?, NOW())`,
    [username, hashed, role, real_name],
  );
  return { id: result.insertId, username, role, real_name };
}

async function getUserById(id) {
  const [rows] = await db.execute(
    `SELECT id, username, role, real_name, metadata FROM users WHERE id = ?`,
    [id],
  );
  return rows[0];
}

async function getUserByUsername(username) {
  const [rows] = await db.execute(`SELECT * FROM users WHERE username = ?`, [
    username,
  ]);
  return rows[0];
}

async function verifyPassword(userRow, password) {
  if (!userRow) return false;
  return bcrypt.compare(password, userRow.password_hash);
}

async function updateUser(id, patch = {}) {
  const fields = [];
  const values = [];
  for (const k of Object.keys(patch)) {
    fields.push(`${k} = ?`);
    values.push(patch[k]);
  }
  if (fields.length === 0) return getUserById(id);
  values.push(id);
  await db.execute(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );
  return getUserById(id);
}

module.exports = {
  createUser,
  getUserById,
  getUserByUsername,
  verifyPassword,
  updateUser,
};
