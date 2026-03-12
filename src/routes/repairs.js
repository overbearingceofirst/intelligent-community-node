const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/repairsController");
const { verifyToken, requireRole } = require("../middleware/auth");

// 创建报修（居民）
router.post(
  "/",
  verifyToken,
  requireRole("resident", "manager", "admin"),
  ctrl.createRepair,
);

// 列表（管理员/物业查看全部，居民查看自己）
router.get("/", verifyToken, ctrl.listRepairs);

// 详情（管理员/物业或本人）
router.get("/:id", verifyToken, ctrl.getRepair);

// 更新（管理员/物业可改状态；本人在提交状态可改内容）
router.put("/:id", verifyToken, ctrl.updateRepair);

// 添加日志/备注（管理员或本人）
router.post("/:id/logs", verifyToken, ctrl.addLog);

// 管理端：指派工单（仅 admin/manager 可以指派）
router.post(
  "/:id/assign",
  verifyToken,
  requireRole("admin", "manager"),
  ctrl.assignRepair,
);

// 状态变更：管理员/物业或被指派人可变更（具体权限与校验在 controller 中）
router.post("/:id/status", verifyToken, ctrl.changeStatus);

module.exports = router;
