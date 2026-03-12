const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/pointsController");
const { verifyToken, requireRole } = require("../middleware/auth");

// 用户端
router.get("/balance", verifyToken, ctrl.getBalance);
router.get("/transactions", verifyToken, ctrl.listTransactions);
router.post("/redeem", verifyToken, ctrl.redeem);

// 公共扫码核销（扫码直接打开该页面即可核销并返回 HTML 成功/失败页面）
router.get(
  "/redemptions/verify/public/:token",
  ctrl.verifyRedemptionPublicPage,
);

// 核销：仅管理/物业人员可调用（扫描二维码后调用此接口）
router.post(
  "/redemptions/verify",
  verifyToken,
  requireRole("admin", "manager"),
  ctrl.verifyRedemption,
);

// 奖励商品（公开查看）
router.get("/rewards", verifyToken, ctrl.listRewards);

// 管理端：管理奖励与调整积分
router.post(
  "/rewards",
  verifyToken,
  requireRole("admin", "manager"),
  ctrl.createReward,
);
router.put(
  "/rewards/:id",
  verifyToken,
  requireRole("admin", "manager"),
  ctrl.updateReward,
);
router.post(
  "/adjust",
  verifyToken,
  requireRole("admin", "manager"),
  ctrl.adminAdjust,
);

module.exports = router;
