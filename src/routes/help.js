const express = require("express");
const router = express.Router();
const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../middleware/validate");
const { verifyToken, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/helpController");

// 创建互助帖
router.post(
  "/",
  verifyToken,
  body("title").isString().isLength({ min: 1, max: 200 }),
  body("content").optional().isString(),
  body("images").optional().isArray(),
  body("anonymous").optional().isBoolean(),
  body("reward").optional().isString().isLength({ max: 255 }),
  handleValidationErrors,
  ctrl.createPost,
);

// 列表
router.get(
  "/",
  verifyToken,
  query("status").optional().isIn(["open", "closed"]),
  query("q").optional().isString(),
  query("page").optional().toInt(),
  query("limit").optional().toInt(),
  handleValidationErrors,
  ctrl.listPosts,
);

// 详情
router.get(
  "/:id",
  verifyToken,
  param("id").isInt(),
  handleValidationErrors,
  ctrl.getPost,
);

// 更新
router.put(
  "/:id",
  verifyToken,
  param("id").isInt(),
  body("title").optional().isString().isLength({ max: 200 }),
  body("content").optional().isString(),
  body("images").optional().isArray(),
  body("anonymous").optional().isBoolean(),
  body("reward").optional().isString().isLength({ max: 255 }),
  body("status").optional().isIn(["open", "closed"]),
  handleValidationErrors,
  ctrl.updatePost,
);

// 删除
router.delete(
  "/:id",
  verifyToken,
  param("id").isInt(),
  handleValidationErrors,
  ctrl.deletePost,
);

// 关闭
router.post(
  "/:id/close",
  verifyToken,
  param("id").isInt(),
  handleValidationErrors,
  ctrl.closePost,
);

// 管理端：审核通过
router.post(
  "/:id/approve",
  verifyToken,
  requireRole("admin", "manager"),
  param("id").isInt(),
  handleValidationErrors,
  ctrl.approvePost,
);

// 管理端：驳回（需提供 reason，可选）
router.post(
  "/:id/reject",
  verifyToken,
  requireRole("admin", "manager"),
  param("id").isInt(),
  body("reason").optional().isString().isLength({ max: 500 }),
  handleValidationErrors,
  ctrl.rejectPost,
);

module.exports = router;
