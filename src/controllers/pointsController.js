const pointsService = require("../services/pointsService");
const qrcode = require("qrcode");
const notificationService = require("../services/notificationService");
const db = require("../config/db");
const { success, error: respError } = require("../utils/response");

async function getBalance(req, res, next) {
  try {
    const userId = req.user.id;
    const balance = await pointsService.getBalance(userId);
    return success(res, { points: balance });
  } catch (err) {
    next(err);
  }
}

async function listTransactions(req, res, next) {
  try {
    const userId = req.user.id;
    const limit = req.query.limit || 100;
    const rows = await pointsService.listTransactions(userId, limit);
    return success(res, rows);
  } catch (err) {
    next(err);
  }
}

// 修改：redeem 返回二维码 data URL（内容为核销 URL），但不再通过邮箱发送二维码
async function redeem(req, res, next) {
  try {
    const userId = req.user.id;
    const { reward_id } = req.body;
    if (!reward_id)
      return res.status(400).json({ error: "reward_id required" });

    const result = await pointsService.redeemReward(userId, reward_id);
    if (!result.ok) {
      if (result.error === "out_of_stock")
        return respError(res, "out_of_stock", 400);
      if (result.error === "insufficient_points")
        return respError(res, "insufficient_points", 400);
      if (result.error === "reward_not_found")
        return respError(res, "reward_not_found", 404);
      return respError(res, result.error, 500);
    }

    const token = result.token;
    // 构建可访问核销 URL（扫码直接打开并核销）
    const base =
      process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const verifyPath = `/api/points/redemptions/verify/public/${token}`;
    const verifyUrl = `${base}${verifyPath}`;

    const qrDataUrl = await qrcode.toDataURL(verifyUrl);

    // 改为仅写站内通知（邮件已禁用）
    try {
      await notificationService.notifyUser(
        userId,
        "兑换已生成",
        `您的兑换（ID: ${result.redemption_id}）已生成，请在指定地点出示二维码核销。`,
        { redemption_id: result.redemption_id, verify_url: verifyUrl },
      );
    } catch (e) {
      console.error("notify user on redeem error", e);
    }

    return success(res, {
      redemption_id: result.redemption_id,
      qr: qrDataUrl,
      expires_at: result.expires_at,
      verify_url: verifyUrl,
    });
  } catch (err) {
    next(err);
  }
}

// 新增：扫码后直接核销并返回 HTML 页面（供物业管理员或前台扫码器直接打开）
async function verifyRedemptionPublicPage(req, res, next) {
  try {
    const token = req.params.token;
    if (!token)
      return res.status(400).send("<h1>核销失败</h1><p>缺少 token</p>");

    const result = await pointsService.verifyRedemptionPublic(token);
    if (!result.ok) {
      let reason = result.error || "unknown";
      if (result.error === "not_found") reason = "未找到该二维码或已核销";
      if (result.error === "invalid_status") reason = "该兑换已被使用";
      if (result.error === "expired") reason = "该二维码已过期";
      return res.status(400).send(`<h1>核销失败</h1><p>原因：${reason}</p>`);
    }

    // 可选：通知用户兑换已完成（异步，不阻塞返回页面）
    try {
      await notificationService.notifyUser(
        result.user_id,
        "兑换已核销",
        `您的兑换（ID: ${result.redemption_id}）已在现场完成，请确认领取。`,
        { redemption_id: result.redemption_id },
      );
    } catch (e) {
      console.error("notify user on public verify error", e);
    }

    return res.send(
      `<h1>核销成功</h1><p>兑换ID：${result.redemption_id}</p><p>请交付礼品给用户。</p>`,
    );
  } catch (err) {
    next(err);
  }
}

// 新增：核销接口（管理端/工作人员使用 token 核销）
async function verifyRedemption(req, res, next) {
  try {
    const verifierId = req.user.id;
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "token required" });

    const result = await pointsService.verifyRedemptionByToken(
      token,
      verifierId,
    );
    if (!result.ok) {
      if (result.error === "not_found")
        return res.status(404).json({ error: "not_found" });
      if (result.error === "invalid_status")
        return res.status(400).json({ error: "invalid_status" });
      if (result.error === "expired")
        return res.status(400).json({ error: "expired" });
      return res
        .status(500)
        .json({ error: result.error, detail: result.detail });
    }

    // 通知用户兑换已核销
    try {
      await notificationService.notifyUser(
        result.user_id,
        "兑换已核销",
        `您的兑换（ID: ${result.redemption_id}）已在现场完成，请确认领取。`,
        { redemption_id: result.redemption_id },
      );
    } catch (e) {
      console.error("notify user on verify error", e);
    }

    res.json({ ok: true, redemption_id: result.redemption_id });
  } catch (err) {
    next(err);
  }
}

// 管理：列出奖励商品（公开也可用此接口）
async function listRewards(req, res, next) {
  try {
    const rows = await pointsService.listRewards();
    return success(res, rows);
  } catch (err) {
    next(err);
  }
}

async function createReward(req, res, next) {
  try {
    const data = req.body;
    if (!data.title || data.cost_points == null)
      return res.status(400).json({ error: "title and cost_points required" });
    const id = await pointsService.createReward(data);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

async function updateReward(req, res, next) {
  try {
    const id = req.params.id;
    const ok = await pointsService.updateReward(id, req.body);
    if (!ok) return res.status(400).json({ error: "nothing_updated" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// 管理：调整用户积分（增/减）
async function adminAdjust(req, res, next) {
  try {
    const adminId = req.user.id;
    const { user_id, change, note } = req.body;
    if (!user_id || change == null)
      return res.status(400).json({ error: "user_id and change required" });
    await pointsService.adminAdjustPoints(
      adminId,
      user_id,
      Number(change),
      note || null,
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBalance,
  listTransactions,
  redeem,
  listRewards,
  createReward,
  updateReward,
  adminAdjust,
  verifyRedemption,
  verifyRedemptionPublicPage,
};
