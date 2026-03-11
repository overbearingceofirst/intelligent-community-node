// src/controllers/authController.js
const jwt = require("jsonwebtoken");
const {
  createUser,
  getUserByUsername,
  verifyPassword,
  getUserById,
} = require("../models/user");

const SECRET = process.env.APP_SECRET || "secret_key";
const TOKEN_EXPIRES_IN = "7d";

async function register(req, res, next) {
  try {
    const { username, password, role, real_name } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });

    const existing = await getUserByUsername(username);
    if (existing)
      return res.status(409).json({ error: "username already exists" });

    const user = await createUser({
      username,
      password,
      role: role || "resident",
      real_name,
    });
    res
      .status(201)
      .json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const userRow = await getUserByUsername(username);
    if (!userRow) return res.status(401).json({ error: "invalid credentials" });
    const ok = await verifyPassword(userRow, password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const payload = {
      id: userRow.id,
      username: userRow.username,
      role: userRow.role,
    };
    const token = jwt.sign(payload, SECRET, { expiresIn: TOKEN_EXPIRES_IN });
    res.json({ token, user: payload });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  // auth middleware attaches req.user
  const user = await getUserById(req.user.id);
  res.json({ user });
}

module.exports = { register, login, me };
