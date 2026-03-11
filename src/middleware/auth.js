// src/middleware/auth.js
const jwt = require("jsonwebtoken");
const SECRET = process.env.APP_SECRET || "secret_key";

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ error: "Authorization header missing" });
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
