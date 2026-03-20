/**
 * 用户管理路由
 */
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as userController from "../controllers/userController";

const router = Router();

// 所有接口需要登录
router.use(authMiddleware);

router.get("/list", userController.list); // 用户列表
router.get("/:id", userController.getById); // 用户详情
router.post("/", userController.create); // 新增用户
router.put("/", userController.update); // 修改用户
router.delete("/:ids", userController.remove); // 删除用户
router.put("/resetPwd", userController.resetPwd); // 重置密码
router.put("/changeStatus", userController.changeStatus); // 修改状态
router.get("/export", userController.exportExcel); // 导出

export default router;
