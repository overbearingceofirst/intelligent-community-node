// src/middleware/auth.js
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "secret_key"; // <=== 使用 JWT_SECRET

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ code: 401, msg: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, msg: "Invalid token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ code: 401, msg: "Unauthorized" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ code: 403, msg: "Forbidden" });
    next();
  };
}

module.exports = { verifyToken, requireRole };
