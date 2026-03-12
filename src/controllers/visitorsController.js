const db = require("../config/db");
const crypto = require("crypto");
const qrcode = require("qrcode");
const notificationService = require("../services/notificationService");

// 创建访客预约（居民发起）
async function createVisitor(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      visitor_name,
      visitor_phone,
      house_id,
      visit_time,
      note,
      expiresDays,
    } = req.body;
    if (!visitor_name || !visit_time)
      return res
        .status(400)
        .json({ error: "visitor_name and visit_time required" });

    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = expiresDays
      ? new Date(Date.now() + Number(expiresDays) * 24 * 3600 * 1000)
      : new Date(new Date(visit_time).getTime() + 24 * 3600 * 1000);

    const [ins] = await db.query(
      "INSERT INTO visitors (visitor_name, visitor_phone, user_id, house_id, visit_time, qr_code, qr_token, expires_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        visitor_name,
        visitor_phone || null,
        userId,
        house_id || null,
        visit_time,
        null,
        token,
        expiresAt,
        "approved", // 直接设为 approved
      ],
    );
    const visitorId = ins.insertId;

    await db.query(
      "INSERT INTO visitor_logs (visitor_id, user_id, action, note) VALUES (?, ?, ?, ?)",
      [visitorId, userId, "created", note || null],
    );
    await db.query(
      "INSERT INTO visitor_logs (visitor_id, user_id, action, note) VALUES (?, ?, ?, ?)",
      [visitorId, userId, "auto_approved", "系统自动通过预约"],
    );

    // 生成核验 URL 与二维码 dataURL
    const base = process.env.PUBLIC_BASE_URL || "";
    const verifyPath = `/api/visitors/verify/public/${token}`;
    const verifyUrl = base
      ? `${base}${verifyPath}`
      : `${req.protocol}://${req.get("host")}${verifyPath}`;
    const qrDataUrl = await qrcode.toDataURL(verifyUrl);

    // 写站内通知给预约人（已通过）
    try {
      await notificationService.notifyUser(
        userId,
        "访客预约已确认",
        `访客 ${visitor_name} 的预约已生成并已确认，您可以使用二维码在到访时核验。`,
        { visitor_id: visitorId, verify_url: verifyUrl },
      );
    } catch (e) {
      console.error("notify on createVisitor", e);
    }

    res.status(201).json({
      id: visitorId,
      qr: qrDataUrl,
      verify_url: verifyUrl,
      expires_at: expiresAt,
    });
  } catch (err) {
    next(err);
  }
}

// 列表（管理员查看全部，居民查看自己的预约）
async function listVisitors(req, res, next) {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    const { status } = req.query;

    let page = Math.max(1, parseInt(req.query.page || 1));
    let limit = Math.min(100, Math.max(1, parseInt(req.query.limit || 20)));
    const offset = (page - 1) * limit;

    const params = [];
    let sql = "SELECT v.* FROM visitors v";
    const filters = [];

    if (status) {
      filters.push("v.status = ?");
      params.push(status);
    }

    if (role === "admin" || role === "manager") {
      // 可查看全部
    } else {
      filters.push("v.user_id = ?");
      params.push(userId);
    }

    const whereClause = filters.length ? " WHERE " + filters.join(" AND ") : "";

    // total count
    const countSql = "SELECT COUNT(*) AS total FROM visitors v" + whereClause;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0] ? countRows[0].total : 0;

    // data with pagination
    sql += whereClause + " ORDER BY v.created_at DESC LIMIT ? OFFSET ?";
    const dataParams = params.concat([limit, offset]);
    const [rows] = await db.query(sql, dataParams);

    res.json({ page, limit, total, data: rows });
  } catch (err) {
    next(err);
  }
}

// 详情（含日志）
async function getVisitor(req, res, next) {
  try {
    const id = req.params.id;
    const role = req.user.role;
    const userId = req.user.id;

    const [rows] = await db.query("SELECT * FROM visitors WHERE id = ?", [id]);
    const visitor = rows[0];
    if (!visitor) return res.status(404).json({ error: "not found" });
    if (!(role === "admin" || role === "manager" || visitor.user_id === userId))
      return res.status(403).json({ error: "forbidden" });

    const [logs] = await db.query(
      "SELECT vl.*, u.username, u.name FROM visitor_logs vl LEFT JOIN users u ON vl.user_id = u.id WHERE vl.visitor_id = ? ORDER BY vl.created_at ASC",
      [id],
    );
    res.json({ ...visitor, logs });
  } catch (err) {
    next(err);
  }
}

// 管理端审批（通过）
async function approveVisitor(req, res, next) {
  try {
    const id = req.params.id;
    const adminId = req.user.id;
    const [rows] = await db.query("SELECT * FROM visitors WHERE id = ?", [id]);
    const visitor = rows[0];
    if (!visitor) return res.status(404).json({ error: "not found" });

    await db.query("UPDATE visitors SET status = ? WHERE id = ?", [
      "approved",
      id,
    ]);
    await db.query(
      "INSERT INTO visitor_logs (visitor_id, user_id, action, note) VALUES (?, ?, ?, ?)",
      [id, adminId, "approved", null],
    );

    // 通知预约人
    try {
      await notificationService.notifyUser(
        visitor.user_id,
        "访客预约已通过",
        `您预约的访客 ${visitor.visitor_name} 已被通过。`,
        { visitor_id: id },
      );
    } catch (e) {
      console.error(e);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// 管理端驳回（需提供 reason）
async function rejectVisitor(req, res, next) {
  try {
    const id = req.params.id;
    const adminId = req.user.id;
    const { reason } = req.body;
    const [rows] = await db.query("SELECT * FROM visitors WHERE id = ?", [id]);
    const visitor = rows[0];
    if (!visitor) return res.status(404).json({ error: "not found" });

    await db.query("UPDATE visitors SET status = ? WHERE id = ?", [
      "rejected",
      id,
    ]);
    await db.query(
      "INSERT INTO visitor_logs (visitor_id, user_id, action, note) VALUES (?, ?, ?, ?)",
      [id, adminId, "rejected", reason || null],
    );

    try {
      await notificationService.notifyUser(
        visitor.user_id,
        "访客预约被驳回",
        `您预约的访客 ${visitor.visitor_name} 被驳回，原因：${reason || "未说明"}`,
        { visitor_id: id },
      );
    } catch (e) {
      console.error(e);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// 公共核验页面：扫码直接访问并完成核销（返回成功/失败 HTML）
async function verifyPublicPage(req, res, next) {
  try {
    const token = req.params.token;
    if (!token)
      return res.status(400).send("<h1>核验失败</h1><p>缺少 token</p>");

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [rows] = await conn.query(
        "SELECT * FROM visitors WHERE qr_token = ? FOR UPDATE",
        [token],
      );
      if (!rows.length) {
        await conn.rollback();
        conn.release();
        return res
          .status(404)
          .send("<h1>核验失败</h1><p>未找到该二维码或已被核销</p>");
      }
      const visitor = rows[0];
      if (visitor.status !== "approved") {
        await conn.rollback();
        conn.release();
        return res
          .status(400)
          .send("<h1>核验失败</h1><p>该预约尚未通过审核或已被驳回</p>");
      }
      if (visitor.expires_at && new Date(visitor.expires_at) < new Date()) {
        await conn.rollback();
        conn.release();
        return res.status(400).send("<h1>核验失败</h1><p>该二维码已过期</p>");
      }

      // 标记为访问成功
      await conn.query(
        "UPDATE visitors SET status = ?, verified = ?, actual_visit_time = ? WHERE id = ?",
        ["visited", 1, new Date(), visitor.id],
      );
      await conn.query(
        "INSERT INTO visitor_logs (visitor_id, user_id, action, note) VALUES (?, ?, ?, ?)",
        [visitor.id, null, "verified_public", "public scan verified"],
      );
      await conn.commit();
      conn.release();

      // 通知预约人
      try {
        await notificationService.notifyUser(
          visitor.user_id,
          "访客已到场核验",
          `您的访客 ${visitor.visitor_name} 已在现场核验通过。`,
          { visitor_id: visitor.id },
        );
      } catch (e) {
        console.error(e);
      }

      return res.send(
        `<h1>核验成功</h1><p>访客：${visitor.visitor_name}</p><p>请交付凭证或放行。</p>`,
      );
    } catch (e) {
      try {
        await conn.rollback();
      } catch (e2) {}
      conn.release();
      console.error(e);
      return res.status(500).send("<h1>核验失败</h1><p>内部错误</p>");
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createVisitor,
  listVisitors,
  getVisitor,
  approveVisitor,
  rejectVisitor,
  verifyPublicPage,
};
