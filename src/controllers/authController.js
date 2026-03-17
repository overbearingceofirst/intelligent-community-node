const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "secretkey";
const { success, error: respError } = require("../utils/response");

// 注册（username/password）
async function register(req, res, next) {
  try {
    const { username, password, name } = req.body;
    if (!username || !password)
      return respError(res, "username/password required", 400);

    const [existing] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username],
    );
    if (existing.length) return respError(res, "username exists", 400);

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)",
      [username, hash, name || null, "resident"],
    );
    const userId = result.insertId;
    return success(res, { id: userId, username });
  } catch (err) {
    next(err);
  }
}

// 登录（username/password）
async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query(
      "SELECT id, username, password, role FROM users WHERE username = ?",
      [username],
    );
    const user = rows[0];
    if (!user) return respError(res, "invalid credentials", 400);
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return respError(res, "invalid credentials", 400);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: "24h" },
    );
    return success(res, { token });
  } catch (err) {
    next(err);
  }
}

// 获取当前用户信息（包含资料字段）
async function me(req, res, next) {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      "SELECT id, username, name, role, real_name_verified FROM users WHERE id = ?",
      [userId],
    );
    const user = rows[0];
    if (!user) return respError(res, "user not found", 404);
    return success(res, user);
  } catch (err) {
    next(err);
  }
}

// 房屋绑定（简单示例）
async function bindHouse(req, res, next) {
  try {
    const userId = req.user.id;
    const { house_id } = req.body;
    if (!house_id) return respError(res, "house_id required", 400);

    const [hrows] = await db.query("SELECT id FROM houses WHERE id = ?", [
      house_id,
    ]);
    if (!hrows.length) return respError(res, "house not found", 404);

    await db.query("UPDATE houses SET owner_id = ? WHERE id = ?", [
      userId,
      house_id,
    ]);
    return success(res);
  } catch (err) {
    next(err);
  }
}

// 更新/填写用户档案（需登录）
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const allowed = [
      "community",
      "room",
      "full_name",
      "gender",
      "resident_type",
      "id_card",
      "passport",
      "domicile",
      "employer",
      "notes",
      "face_image",
    ];
    const updates = [];
    const params = [];
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        updates.push(`${k} = ?`);
        params.push(req.body[k]);
      }
    }
    if (!updates.length)
      return res.status(400).json({ error: "no fields to update" });
    params.push(userId);
    await db.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  me,
  bindHouse,
  updateProfile, // 确保有这一行
};
