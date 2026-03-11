// src/models/repairOrder.js
const db = require("../config/database");

async function createRepairOrder({
  user_id,
  house_id,
  title,
  description,
  images = null,
}) {
  const [result] = await db.execute(
    `INSERT INTO repair_orders (user_id, house_id, title, description, images, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', NOW())`,
    [user_id, house_id, title, description, images],
  );
  return {
    id: result.insertId,
    user_id,
    house_id,
    title,
    description,
    images,
    status: "open",
  };
}

async function getRepairOrderById(id) {
  const [rows] = await db.execute(`SELECT * FROM repair_orders WHERE id = ?`, [
    id,
  ]);
  return rows[0];
}

async function listRepairOrders(filter = {}) {
  const conditions = [];
  const params = [];
  if (filter.user_id) {
    conditions.push("user_id = ?");
    params.push(filter.user_id);
  }
  if (filter.status) {
    conditions.push("status = ?");
    params.push(filter.status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows] = await db.execute(
    `SELECT * FROM repair_orders ${where} ORDER BY created_at DESC`,
    params,
  );
  return rows;
}

async function updateRepairOrderStatus(id, status) {
  await db.execute(`UPDATE repair_orders SET status = ? WHERE id = ?`, [
    status,
    id,
  ]);
  return getRepairOrderById(id);
}

module.exports = {
  createRepairOrder,
  getRepairOrderById,
  listRepairOrders,
  updateRepairOrderStatus,
};
