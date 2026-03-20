/**
 * 应用入口文件
 * 配置 Express 服务、中间件、路由，启动服务并同步数据库
 */
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

// 加载环境变量（必须在其他模块之前）
dotenv.config();

import { sequelize } from "./models";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { initAdmin } from "./utils/initAdmin";

// 路由导入
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import roleRoutes from "./routes/role";
import menuRoutes from "./routes/menu";
import logRoutes from "./routes/log";
import uploadRoutes from "./routes/upload";
import residentRoutes from "./routes/resident";
import repairRoutes from "./routes/repair";
import paymentRoutes from "./routes/payment";
import noticeRoutes from "./routes/notice";
import mutualRoutes from "./routes/mutual";
import idleRoutes from "./routes/idle";
import visitorRoutes from "./routes/visitor";
import pointsRoutes from "./routes/points";
import settingRoutes from "./routes/setting";
import dashboardRoutes from "./routes/dashboard";

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ==================== 中间件配置 ====================

// 跨域配置
app.use(
  cors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    credentials: true,
  }),
);

// 请求体解析
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 请求日志记录
app.use(requestLogger);

// 静态文件服务（上传目录）
app.use("/uploads", express.static("uploads"));

// ==================== 路由配置 ====================

// 健康检查接口
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    code: 200,
    msg: "ok",
    data: { status: "healthy", timestamp: new Date().toISOString() },
  });
});

// API 路由
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/system/user", userRoutes);
app.use("/api/system/role", roleRoutes);
app.use("/api/system/menu", menuRoutes);
app.use("/api/system/log", logRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/resident", residentRoutes);
app.use("/api/repair", repairRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notice", noticeRoutes);
app.use("/api/mutual", mutualRoutes);
app.use("/api/idle", idleRoutes);
app.use("/api/visitor", visitorRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/setting", settingRoutes);

// 若依风格：获取路由配置
app.get("/api/getRouters", (req: Request, res: Response) => {
  // 返回前端动态路由配置
  res.json({
    code: 200,
    msg: "操作成功",
    data: require("./config/menus.json"),
  });
});

// 404 处理
app.use((_req: Request, res: Response) => {
  res.status(404).json({ code: 404, msg: "接口不存在" });
});

// 全局错误处理
app.use(errorHandler);

// ==================== 启动服务 ====================

async function bootstrap() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    logger.info("✅ 数据库连接成功");

    // 同步数据库表结构（开发环境使用 alter，生产环境建议使用 migrations）
    await sequelize.sync({ alter: true });
    logger.info("✅ 数据库表同步完成");

    // 初始化管理员账号
    await initAdmin();

    // 启动 HTTP 服务
    app.listen(PORT, () => {
      logger.info(`🚀 服务启动成功: http://localhost:${PORT}`);
      logger.info(`📚 健康检查: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error("❌ 服务启动失败:", error);
    process.exit(1);
  }
}

bootstrap();
