const db = require("../config/db");
const crypto = require("crypto");

async function getBalance(userId) {
  const [rows] = await db.query("SELECT points FROM users WHERE id = ?", [
    userId,
  ]);
  return rows[0] ? rows[0].points : 0;
}

async function listTransactions(userId, limit = 100) {
  const [rows] = await db.query(
    "SELECT id, `change`, type, note, related_id, created_at FROM points_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
    [userId, Number(limit)],
  );
  return rows;
}

async function createTransaction(
  userId,
  change,
  type,
  note = null,
  related_id = null,
) {
  await db.query(
    "INSERT INTO points_transactions (user_id, `change`, type, note, related_id) VALUES (?, ?, ?, ?, ?)",
    [userId, change, type, note, related_id],
  );
  return true;
}

async function adminAdjustPoints(adminId, userId, change, note = null) {
  // change can be positive or negative
  await db.query("UPDATE users SET points = points + ? WHERE id = ?", [
    change,
    userId,
  ]);
  await createTransaction(userId, change, "admin_adjust", note, adminId);
  return true;
}

async function listRewards() {
  const [rows] = await db.query(
    "SELECT id, title, description, cost_points, stock, created_at FROM rewards ORDER BY created_at DESC",
  );
  return rows;
}

async function getRewardById(rewardId) {
  const [rows] = await db.query("SELECT * FROM rewards WHERE id = ?", [
    rewardId,
  ]);
  return rows[0];
}

async function createReward(data) {
  const { title, description, cost_points, stock } = data;
  const [result] = await db.query(
    "INSERT INTO rewards (title, description, cost_points, stock) VALUES (?, ?, ?, ?)",
    [title, description || null, cost_points || 0, stock || 0],
  );
  return result.insertId;
}

async function updateReward(rewardId, data) {
  const updates = [];
  const params = [];
  if (data.title !== undefined) {
    updates.push("title = ?");
    params.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    params.push(data.description);
  }
  if (data.cost_points !== undefined) {
    updates.push("cost_points = ?");
    params.push(data.cost_points);
  }
  if (data.stock !== undefined) {
    updates.push("stock = ?");
    params.push(data.stock);
  }
  if (!updates.length) return false;
  params.push(rewardId);
  await db.query(
    `UPDATE rewards SET ${updates.join(", ")} WHERE id = ?`,
    params,
  );
  return true;
}

// 事务化兑换：生成 qr_token，检查库存、检查用户积分、更新库存、扣减用户积分、写流水与兑换记录（status = 'pending'）
async function redeemReward(userId, rewardId, opts = {}) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rrows] = await conn.query(
      "SELECT * FROM rewards WHERE id = ? FOR UPDATE",
      [rewardId],
    );
    if (!rrows.length) {
      await conn.rollback();
      conn.release();
      return { ok: false, error: "reward_not_found" };
    }
    const reward = rrows[0];
    if (reward.stock <= 0) {
      await conn.rollback();
      conn.release();
      return { ok: false, error: "out_of_stock" };
    }

    const [urows] = await conn.query(
      "SELECT points FROM users WHERE id = ? FOR UPDATE",
      [userId],
    );
    if (!urows.length) {
      await conn.rollback();
      conn.release();
      return { ok: false, error: "user_not_found" };
    }
    const user = urows[0];
    if (user.points < reward.cost_points) {
      await conn.rollback();
      conn.release();
      return { ok: false, error: "insufficient_points" };
    }

    // 生成唯一 qr_token
    const token = crypto.randomBytes(16).toString("hex");
    // 设置过期时间（默认 7 天）
    const expiresAt = new Date(
      Date.now() + (opts.expiresDays || 7) * 24 * 3600 * 1000,
    );

    // 扣减库存与用户积分
    await conn.query("UPDATE rewards SET stock = stock - 1 WHERE id = ?", [
      rewardId,
    ]);
    await conn.query("UPDATE users SET points = points - ? WHERE id = ?", [
      reward.cost_points,
      userId,
    ]);

    // 写流水（负值）
    await conn.query(
      "INSERT INTO points_transactions (user_id, `change`, type, note, related_id) VALUES (?, ?, ?, ?, ?)",
      [
        userId,
        -reward.cost_points,
        "redeem",
        `Redeem reward ${rewardId}`,
        rewardId,
      ],
    );

    // 写兑换记录（status pending，包含 qr_token 与 expires_at）
    const [ins] = await conn.query(
      "INSERT INTO redemptions (user_id, reward_id, status, qr_token, expires_at, note) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, rewardId, "pending", token, expiresAt, null],
    );

    await conn.commit();
    conn.release();
    return {
      ok: true,
      redemption_id: ins.insertId,
      token,
      expires_at: expiresAt,
    };
  } catch (err) {
    try {
      await conn.rollback();
    } catch (e) {}
    conn.release();
    return { ok: false, error: "internal_error", detail: err.message };
  }
}

// 核销兑换：通过 qr_token 或 redemption_id，由工作人员（或管理端）进行核验并将状态改为 completed
async function verifyRedemptionByToken(token, verifierId) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      "SELECT * FROM redemptions WHERE qr_token = ? FOR UPDATE",
      [token],
    );
    if (!rows.length) {
      await conn.rollback();
      conn.release();
      return { ok: false, error: "not_found" };
    }
    const redemption = rows[0];
    if (redemption.status !== "pending") {
      await conn.rollback();
      conn.release();
      return { ok: false, error: "invalid_status" };
    }
    if (redemption.expires_at && new Date(redemption.expires_at) < new Date()) {
      await conn.rollback();
      conn.release();
      return { ok: false, error: "expired" };
    }

    await conn.query(
      "UPDATE redemptions SET status = ?, note = ? WHERE id = ?",
      ["completed", `verified_by_${verifierId}`, redemption.id],
    );
    await conn.commit();
    conn.release();
    return {
      ok: true,
      redemption_id: redemption.id,
      user_id: redemption.user_id,
      reward_id: redemption.reward_id,
    };
  } catch (err) {
    try {
      await conn.rollback();
    } catch (e) {}
    conn.release();
    return { ok: false, error: "internal_error", detail: err.message };
  }
}

// 新增：公共核销（扫码直接调用，不需要 verifier id；记录 note 为 verified_public）
async function verifyRedemptionPublic(token) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      "SELECT * FROM redemptions WHERE qr_token = ? FOR UPDATE",
      [token],
    );
    if (!rows.length) {
      await conn.rollback();
      conn.release();
      return { ok: false, error: "not_found" };
    }
    const redemption = rows[0];
    if (redemption.status !== "pending") {
      await conn.rollback();
      conn.release();
      return { ok: false, error: "invalid_status" };
    }
    if (redemption.expires_at && new Date(redemption.expires_at) < new Date()) {
      await conn.rollback();
      conn.release();
      return { ok: false, error: "expired" };
    }

    await conn.query(
      "UPDATE redemptions SET status = ?, note = ? WHERE id = ?",
      ["completed", "verified_public", redemption.id],
    );
    await conn.commit();
    conn.release();
    return {
      ok: true,
      redemption_id: redemption.id,
      user_id: redemption.user_id,
      reward_id: redemption.reward_id,
    };
  } catch (err) {
    try {
      await conn.rollback();
    } catch (e) {}
    conn.release();
    return { ok: false, error: "internal_error", detail: err.message };
  }
}

module.exports = {
  getBalance,
  listTransactions,
  createTransaction,
  adminAdjustPoints,
  listRewards,
  getRewardById,
  createReward,
  updateReward,
  redeemReward,
  verifyRedemptionByToken,
  verifyRedemptionPublic,
};
