const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/visitorsController");
const { verifyToken, requireRole } = require("../middleware/auth");
const { body } = require("express-validator");
const { handleValidationErrors } = require("../middleware/validate");

// 居民创建访客预约
router.post(
  "/",
  verifyToken,
  requireRole("resident", "manager", "admin"),
  body("visitor_name").isString().isLength({ min: 1, max: 100 }),
  body("visit_time").isISO8601(),
  body("visitor_phone").optional().isString().isLength({ max: 50 }),
  handleValidationErrors,
  ctrl.createVisitor,
);

// 列表（管理员查看全部，居民查看自己）
router.get("/", verifyToken, ctrl.listVisitors);

// 详情（含日志）
router.get("/:id", verifyToken, ctrl.getVisitor);

// 管理端审批与驳回
router.post(
  "/:id/approve",
  verifyToken,
  requireRole("admin", "manager"),
  ctrl.approveVisitor,
);
router.post(
  "/:id/reject",
  verifyToken,
  requireRole("admin", "manager"),
  ctrl.rejectVisitor,
);

// 公共扫码核验（扫码器访问该页面，直接核销并返回 HTML 成功/失败页面）
router.get("/verify/public/:token", ctrl.verifyPublicPage);

module.exports = router;
