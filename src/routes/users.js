const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, requireRole } = require("../middleware/auth");
const { success, error: respError } = require("../utils/response");

// 获取当前用户资料
router.get("/profile", verifyToken, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username, name, role FROM users WHERE id = ?",
      [req.user.id],
    );
    return success(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

// 管理端：列出所有用户（仅 admin/manager），支持分页并返回 total
router.get(
  "/",
  verifyToken,
  requireRole("admin", "manager"),
  async (req, res, next) => {
    try {
      let page = Math.max(1, parseInt(req.query.page || 1));
      let limit = Math.min(100, Math.max(1, parseInt(req.query.limit || 20)));
      const offset = (page - 1) * limit;

      // total count
      const [countRows] = await db.query(
        "SELECT COUNT(*) AS total FROM users",
        [],
      );
      const total = countRows[0] ? countRows[0].total : 0;

      const [rows] = await db.query(
        "SELECT id, username, name, role, points FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [limit, offset],
      );
      return success(res, { page, limit, total, data: rows });
    } catch (err) {
      next(err);
    }
  },
);

// 管理端：变更用户角色（示例，仅 admin）
router.post(
  "/:id/role",
  verifyToken,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const targetId = req.params.id;
      const { role } = req.body;
      await db.query("UPDATE users SET role = ? WHERE id = ?", [
        role,
        targetId,
      ]);
      return success(res);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
