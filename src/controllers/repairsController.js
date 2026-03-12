const db = require("../config/db");
const notificationService = require("../services/notificationService");

const ALLOWED_STATUSES = [
  "submitted",
  "accepted",
  "processing",
  "completed",
  "cancelled",
];

// 新增：允许的状态流转（当前 -> 可到达的下一个状态）
const STATUS_TRANSITIONS = {
  submitted: ["accepted", "cancelled"],
  accepted: ["processing", "cancelled"],
  processing: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

function canTransition(from, to) {
  if (from === to) return true;
  const allowed = STATUS_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

async function createRepair(req, res, next) {
  try {
    const userId = req.user.id;
    const { house_id, title, description } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });

    const [result] = await db.query(
      "INSERT INTO repairs (user_id, house_id, title, description, status) VALUES (?, ?, ?, ?, ?)",
      [userId, house_id || null, title, description || null, "submitted"],
    );

    const repairId = result.insertId;
    await db.query(
      "INSERT INTO repair_logs (repair_id, user_id, action, note) VALUES (?, ?, ?, ?)",
      [repairId, userId, "created", "用户提交报修"],
    );
    res.status(201).json({ id: repairId });
  } catch (err) {
    next(err);
  }
}

async function listRepairs(req, res, next) {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    const { status, house_id } = req.query;

    let page = Math.max(1, parseInt(req.query.page || 1));
    let limit = Math.min(100, Math.max(1, parseInt(req.query.limit || 20)));
    const offset = (page - 1) * limit;

    let sql = "SELECT r.* FROM repairs r";
    const params = [];
    const filters = [];

    if (status) {
      filters.push("r.status = ?");
      params.push(status);
    }
    if (house_id) {
      filters.push("r.house_id = ?");
      params.push(house_id);
    }

    if (role === "admin" || role === "manager") {
      // 管理员/物业可以查看所有
    } else {
      filters.push("r.user_id = ?");
      params.push(userId);
    }

    const whereClause = filters.length ? " WHERE " + filters.join(" AND ") : "";
    // total count
    const countSql = "SELECT COUNT(*) AS total FROM repairs r" + whereClause;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0] ? countRows[0].total : 0;

    // data with pagination
    sql += whereClause + " ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
    const dataParams = params.concat([limit, offset]);
    const [rows] = await db.query(sql, dataParams);

    res.json({ page, limit, total, data: rows });
  } catch (err) {
    next(err);
  }
}

async function getRepair(req, res, next) {
  try {
    const id = req.params.id;
    const role = req.user.role;
    const userId = req.user.id;

    const [rows] = await db.query("SELECT * FROM repairs WHERE id = ?", [id]);
    const repair = rows[0];
    if (!repair) return res.status(404).json({ error: "repair not found" });
    if (
      !(role === "admin" || role === "manager" || repair.user_id === userId)
    ) {
      return res.status(403).json({ error: "forbidden" });
    }

    const [logs] = await db.query(
      "SELECT rl.*, u.username, u.name FROM repair_logs rl LEFT JOIN users u ON rl.user_id = u.id WHERE rl.repair_id = ? ORDER BY rl.created_at ASC",
      [id],
    );
    res.json({ ...repair, logs });
  } catch (err) {
    next(err);
  }
}

async function updateRepair(req, res, next) {
  try {
    const id = req.params.id;
    const role = req.user.role;
    const userId = req.user.id;
    const { title, description, status } = req.body;

    const [rows] = await db.query("SELECT * FROM repairs WHERE id = ?", [id]);
    const repair = rows[0];
    if (!repair) return res.status(404).json({ error: "repair not found" });

    // 权限与基本规则：
    if (role === "admin" || role === "manager") {
      // 管理端可以更新状态（需要在 ALLOWED_STATUSES 中）
      if (status && !ALLOWED_STATUSES.includes(status))
        return res.status(400).json({ error: "invalid status" });

      const updates = [];
      const params = [];
      if (status) {
        updates.push("status = ?");
        params.push(status);
      }
      if (title) {
        updates.push("title = ?");
        params.push(title);
      }
      if (description) {
        updates.push("description = ?");
        params.push(description);
      }

      if (updates.length) {
        params.push(id);
        await db.query(
          `UPDATE repairs SET ${updates.join(", ")} WHERE id = ?`,
          params,
        );
        if (status) {
          await db.query(
            "INSERT INTO repair_logs (repair_id, user_id, action, note) VALUES (?, ?, ?, ?)",
            [id, userId, "status_change", `status -> ${status}`],
          );
        } else {
          await db.query(
            "INSERT INTO repair_logs (repair_id, user_id, action, note) VALUES (?, ?, ?, ?)",
            [id, userId, "updated", "管理端更新报修信息"],
          );
        }
      }
      return res.json({ ok: true });
    }

    // 普通居民只能更新自己的请求，且仅在初始提交阶段允许修改标题/描述
    if (repair.user_id !== userId)
      return res.status(403).json({ error: "forbidden" });
    if (repair.status !== "submitted")
      return res
        .status(400)
        .json({ error: "cannot modify after processing started" });

    const updates = [];
    const params = [];
    if (title) {
      updates.push("title = ?");
      params.push(title);
    }
    if (description) {
      updates.push("description = ?");
      params.push(description);
    }
    if (!updates.length)
      return res.status(400).json({ error: "nothing to update" });

    params.push(id);
    await db.query(
      `UPDATE repairs SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );
    await db.query(
      "INSERT INTO repair_logs (repair_id, user_id, action, note) VALUES (?, ?, ?, ?)",
      [id, userId, "updated", "用户修改报修内容"],
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function addLog(req, res, next) {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const { action, note } = req.body;
    if (!action) return res.status(400).json({ error: "action required" });

    const [rows] = await db.query(
      "SELECT id, user_id FROM repairs WHERE id = ?",
      [id],
    );
    if (!rows.length)
      return res.status(404).json({ error: "repair not found" });
    const repair = rows[0];
    const role = req.user.role;
    if (
      !(role === "admin" || role === "manager" || repair.user_id === userId)
    ) {
      return res.status(403).json({ error: "forbidden" });
    }

    await db.query(
      "INSERT INTO repair_logs (repair_id, user_id, action, note) VALUES (?, ?, ?, ?)",
      [id, userId, action, note || null],
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// 新增：指派工单（仅 manager/admin）
async function assignRepair(req, res, next) {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const { assignee_id } = req.body;
    if (!assignee_id)
      return res.status(400).json({ error: "assignee_id required" });

    const [rrows] = await db.query("SELECT * FROM repairs WHERE id = ?", [id]);
    if (!rrows.length)
      return res.status(404).json({ error: "repair not found" });

    await db.query("UPDATE repairs SET assignee_id = ? WHERE id = ?", [
      assignee_id,
      id,
    ]);
    await db.query(
      "INSERT INTO repair_logs (repair_id, user_id, action, note) VALUES (?, ?, ?, ?)",
      [id, userId, "assigned", `assigned to user ${assignee_id}`],
    );

    // 通知被指派人
    try {
      await notificationService.notifyUser(
        assignee_id,
        "新工单指派",
        `您被指派处理报修 #${id}，请尽快查看。`,
        { repair_id: id },
      );
    } catch (e) {
      console.error("notify assign error", e);
    }

    // 通知报修人（告知已指派）
    try {
      const ownerId = rrows[0].user_id;
      await notificationService.notifyUser(
        ownerId,
        "工单已指派",
        `您的报修 #${id} 已被指派给工作人员（用户 ${assignee_id}）。`,
        { repair_id: id },
      );
    } catch (e) {
      console.error("notify owner on assign error", e);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// 新增：独立的状态变更接口（管理员/物业或被指派人）
async function changeStatus(req, res, next) {
  try {
    const id = req.params.id;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status required" });
    if (!ALLOWED_STATUSES.includes(status))
      return res.status(400).json({ error: "invalid status" });

    const userId = req.user.id;
    const role = req.user.role;

    const [rrows] = await db.query("SELECT * FROM repairs WHERE id = ?", [id]);
    if (!rrows.length)
      return res.status(404).json({ error: "repair not found" });
    const repair = rrows[0];

    const isAssignee =
      repair.assignee_id && String(repair.assignee_id) === String(userId);
    const allowedActors = role === "admin" || role === "manager" || isAssignee;
    if (!allowedActors) {
      if (!(repair.user_id === userId && status === "cancelled")) {
        return res.status(403).json({ error: "forbidden" });
      }
    }

    if (!canTransition(repair.status, status)) {
      return res.status(400).json({
        error: `invalid transition from ${repair.status} to ${status}`,
      });
    }

    await db.query("UPDATE repairs SET status = ? WHERE id = ?", [status, id]);
    await db.query(
      "INSERT INTO repair_logs (repair_id, user_id, action, note) VALUES (?, ?, ?, ?)",
      [id, userId, "status_change", `status ${repair.status} -> ${status}`],
    );

    // 通知报修人与指派人
    try {
      await notificationService.notifyUser(
        repair.user_id,
        "工单状态更新",
        `您的报修 #${id} 状态已更新为 ${status}。`,
        { repair_id: id, status },
      );
    } catch (e) {
      console.error("notify owner on status change", e);
    }

    if (repair.assignee_id) {
      try {
        await notificationService.notifyUser(
          repair.assignee_id,
          "工单状态更新",
          `工单 #${id} 状态已更新为 ${status}。`,
          { repair_id: id, status },
        );
      } catch (e) {
        console.error("notify assignee on status change", e);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRepair,
  listRepairs,
  getRepair,
  updateRepair,
  addLog,
  assignRepair,
  changeStatus,
};
