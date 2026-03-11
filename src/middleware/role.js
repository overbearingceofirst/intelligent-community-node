// src/middleware/role.js
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = (req.user && req.user.role) || "resident";
    if (allowedRoles.includes(role)) return next();
    return res.status(403).json({ error: "Forbidden: insufficient role" });
  };
}

module.exports = requireRole;
