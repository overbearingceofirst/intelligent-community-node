// src/models/house.js
const db = require("../config/database");

async function createHouse({ building, unit, room, owner_user_id = null }) {
  const [result] = await db.execute(
    `INSERT INTO houses (building, unit, room, owner_user_id, created_at) VALUES (?, ?, ?, ?, NOW())`,
    [building, unit, room, owner_user_id],
  );
  return { id: result.insertId, building, unit, room, owner_user_id };
}

async function getHouseById(id) {
  const [rows] = await db.execute(`SELECT * FROM houses WHERE id = ?`, [id]);
  return rows[0];
}

async function bindHouseToUser(houseId, userId) {
  await db.execute(`UPDATE houses SET owner_user_id = ? WHERE id = ?`, [
    userId,
    houseId,
  ]);
  return getHouseById(houseId);
}

async function listHousesForUser(userId) {
  const [rows] = await db.execute(
    `SELECT * FROM houses WHERE owner_user_id = ?`,
    [userId],
  );
  return rows;
}

module.exports = {
  createHouse,
  getHouseById,
  bindHouseToUser,
  listHousesForUser,
};
