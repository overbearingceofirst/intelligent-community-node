const db = require("../config/db");
const notificationService = require("../services/notificationService");

// 创建互助帖（提交后进入 pending，需管理员审核）
async function createPost(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, content, images, anonymous, reward } = req.body;
    if (!title || typeof title !== "string")
      return res.status(400).json({ error: "title required" });

    const imagesJson =
      images && Array.isArray(images) ? JSON.stringify(images) : null;
    const [result] = await db.query(
      "INSERT INTO help_posts (user_id, title, content, images, anonymous, reward, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        title,
        content || null,
        imagesJson,
        anonymous ? 1 : 0,
        reward || null,
        "pending",
      ],
    );
    const postId = result.insertId;

    await db
      .query(
        "INSERT INTO visitor_logs (visitor_id, user_id, action, note) VALUES (?, ?, ?, ?)",
        [postId, userId, "created", "用户提交互助需求（待审核）"],
      )
      .catch(() => {
        /* ignore if table differs */
      });

    // 通知发布者（站内通知）
    try {
      await notificationService.notifyUser(
        userId,
        "互助需求已提交",
        `您的互助《${title}》已提交，等待管理员审核。`,
        { post_id: postId },
      );
    } catch (e) {
      console.error("notify on createPost", e);
    }

    res.status(201).json({ id: postId, status: "pending" });
  } catch (err) {
    next(err);
  }
}

// 管理端：通过互助帖（将 status 置为 open）
async function approvePost(req, res, next) {
  try {
    const adminId = req.user.id;
    const id = req.params.id;
    const [rows] = await db.query("SELECT * FROM help_posts WHERE id = ?", [
      id,
    ]);
    const post = rows[0];
    if (!post) return res.status(404).json({ error: "not_found" });

    await db.query(
      "UPDATE help_posts SET status = ?, updated_at = ? WHERE id = ?",
      ["open", new Date(), id],
    );
    await db
      .query(
        "INSERT INTO visitor_logs (visitor_id, user_id, action, note) VALUES (?, ?, ?, ?)",
        [id, adminId, "approved", "管理员通过互助需求"],
      )
      .catch(() => {
        /* ignore */
      });

    try {
      await notificationService.notifyUser(
        post.user_id,
        "互助需求已通过",
        `您的互助《${post.title}》已通过审核并已发布。`,
        { post_id: id },
      );
    } catch (e) {
      console.error(e);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// 管理端：驳回互助帖（填 reason，status 置为 rejected）
async function rejectPost(req, res, next) {
  try {
    const adminId = req.user.id;
    const id = req.params.id;
    const { reason } = req.body;
    const [rows] = await db.query("SELECT * FROM help_posts WHERE id = ?", [
      id,
    ]);
    const post = rows[0];
    if (!post) return res.status(404).json({ error: "not_found" });

    await db.query(
      "UPDATE help_posts SET status = ?, updated_at = ? WHERE id = ?",
      ["rejected", new Date(), id],
    );
    await db
      .query(
        "INSERT INTO visitor_logs (visitor_id, user_id, action, note) VALUES (?, ?, ?, ?)",
        [id, adminId, "rejected", reason || "无理由"],
      )
      .catch(() => {
        /* ignore */
      });

    try {
      await notificationService.notifyUser(
        post.user_id,
        "互助需求被驳回",
        `您的互助《${post.title}》已被驳回，原因：${reason || "未说明"}`,
        { post_id: id },
      );
    } catch (e) {
      console.error(e);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// 列表（分页、status、search）
async function listPosts(req, res, next) {
  try {
    const { status, q } = req.query;
    let page = Math.max(1, parseInt(req.query.page || 1));
    let limit = Math.min(100, Math.max(1, parseInt(req.query.limit || 20)));
    const offset = (page - 1) * limit;

    const filters = [];
    const params = [];

    if (status) {
      filters.push("p.status = ?");
      params.push(status);
    }
    if (q) {
      filters.push("(p.title LIKE ? OR p.content LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }

    const where = filters.length ? " WHERE " + filters.join(" AND ") : "";

    // total
    const countSql = "SELECT COUNT(*) AS total FROM help_posts p" + where;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0] ? countRows[0].total : 0;

    // data
    const dataSql =
      "SELECT p.* FROM help_posts p" +
      where +
      " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
    const dataParams = params.concat([limit, offset]);
    const [rows] = await db.query(dataSql, dataParams);

    // 解析 images JSON & 隐藏作者信息 when anonymous
    const items = rows.map((r) => {
      const images = r.images ? JSON.parse(r.images) : [];
      return {
        id: r.id,
        title: r.title,
        content: r.content,
        images,
        anonymous: !!r.anonymous,
        reward: r.reward,
        status: r.status,
        created_at: r.created_at,
        updated_at: r.updated_at,
        user_id: r.anonymous ? null : r.user_id,
      };
    });

    res.json({ page, limit, total, data: items });
  } catch (err) {
    next(err);
  }
}

// 详情
async function getPost(req, res, next) {
  try {
    const id = req.params.id;
    const [rows] = await db.query(
      "SELECT p.*, u.username, u.name FROM help_posts p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ?",
      [id],
    );
    const post = rows[0];
    if (!post) return res.status(404).json({ error: "not_found" });

    const images = post.images ? JSON.parse(post.images) : [];
    const author = post.anonymous
      ? null
      : { id: post.user_id, username: post.username, name: post.name };
    res.json({
      id: post.id,
      title: post.title,
      content: post.content,
      images,
      anonymous: !!post.anonymous,
      reward: post.reward,
      status: post.status,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author,
    });
  } catch (err) {
    next(err);
  }
}

// 更新（发帖者 or admin/manager）
async function updatePost(req, res, next) {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const id = req.params.id;
    const { title, content, images, anonymous, reward, status } = req.body;

    const [rows] = await db.query("SELECT * FROM help_posts WHERE id = ?", [
      id,
    ]);
    const post = rows[0];
    if (!post) return res.status(404).json({ error: "not_found" });

    if (!(post.user_id === userId || role === "admin" || role === "manager")) {
      return res.status(403).json({ error: "forbidden" });
    }

    const updates = [];
    const params = [];
    if (title !== undefined) {
      updates.push("title = ?");
      params.push(title);
    }
    if (content !== undefined) {
      updates.push("content = ?");
      params.push(content);
    }
    if (images !== undefined) {
      updates.push("images = ?");
      params.push(
        images && Array.isArray(images) ? JSON.stringify(images) : null,
      );
    }
    if (anonymous !== undefined) {
      updates.push("anonymous = ?");
      params.push(anonymous ? 1 : 0);
    }
    if (reward !== undefined) {
      updates.push("reward = ?");
      params.push(reward);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      params.push(status);
    }
    if (!updates.length)
      return res.status(400).json({ error: "nothing_to_update" });

    updates.push("updated_at = ?");
    params.push(new Date());
    params.push(id);
    await db.query(
      `UPDATE help_posts SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// 删除（发帖者 or admin/manager）
async function deletePost(req, res, next) {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const id = req.params.id;
    const [rows] = await db.query("SELECT * FROM help_posts WHERE id = ?", [
      id,
    ]);
    const post = rows[0];
    if (!post) return res.status(404).json({ error: "not_found" });

    if (!(post.user_id === userId || role === "admin" || role === "manager")) {
      return res.status(403).json({ error: "forbidden" });
    }

    await db.query("DELETE FROM help_posts WHERE id = ?", [id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// 关闭（发帖者 or admin/manager）
async function closePost(req, res, next) {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const id = req.params.id;
    const [rows] = await db.query("SELECT * FROM help_posts WHERE id = ?", [
      id,
    ]);
    const post = rows[0];
    if (!post) return res.status(404).json({ error: "not_found" });

    if (!(post.user_id === userId || role === "admin" || role === "manager")) {
      return res.status(403).json({ error: "forbidden" });
    }

    await db.query(
      "UPDATE help_posts SET status = ?, updated_at = ? WHERE id = ?",
      ["closed", new Date(), id],
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPost,
  listPosts,
  getPost,
  updatePost,
  deletePost,
  closePost,
  approvePost,
  rejectPost,
};
