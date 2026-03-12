const bcrypt = require("bcryptjs");
require("dotenv").config();
const db = require("../src/config/db");

async function createAdmin(username, password, name) {
  if (!username || !password) {
    console.error(
      "Usage: node scripts/createAdmin.js <username> <password> [name]",
    );
    process.exit(1);
  }
  try {
    const [existing] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username],
    );
    if (existing.length) {
      console.error("用户已存在：", username);
      process.exit(1);
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)",
      [username, hash, name || null, "admin"],
    );
    console.log("创建成功，id=", result.insertId);
    process.exit(0);
  } catch (err) {
    console.error("创建管理员失败：", err);
    process.exit(1);
  }
}

const argv = process.argv.slice(2);
createAdmin(argv[0], argv[1], argv[2]);
