const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// 获取当前用户的通知（分页：?page=1&limit=20，可传 ?unread=1）
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { unread } = req.query;
    let page = Math.max(1, parseInt(req.query.page || 1));
    let limit = Math.min(100, Math.max(1, parseInt(req.query.limit || 20)));
    const offset = (page - 1) * limit;

    const params = [userId];
    let baseWhere = " WHERE user_id = ?";
    if (unread === "1") {
      baseWhere += " AND `read` = 0";
    }

    // total count
    const countSql = "SELECT COUNT(*) AS total FROM notifications" + baseWhere;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0] ? countRows[0].total : 0;

    // data
    let sql =
      "SELECT id, title, body, meta, `read`, created_at FROM notifications" +
      baseWhere +
      " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    const dataParams = params.concat([limit, offset]);
    const [rows] = await db.query(sql, dataParams);

    res.json({ page, limit, total, data: rows });
  } catch (err) {
    next(err);
  }
});

// 标记通知为已读
router.post("/:id/read", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    await db.query(
      "UPDATE notifications SET `read` = 1 WHERE id = ? AND user_id = ?",
      [id, userId],
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
