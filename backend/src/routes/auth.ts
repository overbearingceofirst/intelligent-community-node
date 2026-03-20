/**
 * 认证相关路由
 */
import { Router } from "express";
import {
  login,
  getInfo,
  logout,
  getRouters,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// 登录
router.post("/login", login);

// 获取用户信息（需登录）
router.get("/getInfo", authMiddleware, getInfo);

// 获取路由配置（需登录）
router.get("/getRouters", authMiddleware, getRouters);

// 退出登录
router.post("/logout", authMiddleware, logout);

export default router;
