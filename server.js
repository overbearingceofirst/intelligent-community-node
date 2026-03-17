// server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const db = require("./src/config/db");
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");
const repairsRoutes = require("./src/routes/repairs");
const notificationsRoutes = require("./src/routes/notifications");
const pointsRoutes = require("./src/routes/points");
const visitorsRoutes = require("./src/routes/visitors");
const fs = require("fs");
const path = require("path");
const uploadsRoutes = require("./src/routes/uploads");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const notificationQueue = require("./src/services/notificationQueue");
const helpRoutes = require("./src/routes/help");

const app = express();
app.use(bodyParser.json());

// 安全中间件
app.use(helmet());
app.use(cors());

// 简单全局速率限制（例如：每 IP 每分钟 100 次）
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 确保 uploads 目录存在
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 静态托管 uploads（前端通过返回的 /uploads/.. URL 访问）
app.use("/uploads", express.static(uploadsDir));

// 上传路由
app.use("/api/uploads", uploadsRoutes);

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/repairs", repairsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/visitors", visitorsRoutes);
app.use("/api/help", helpRoutes);

// Basic health check
app.get("/health", (req, res) => res.json({ ok: true }));

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ code: err.status || 500, msg: err.message || "操作失败" });
});

// 启动通知队列 worker（异步处理通知）
notificationQueue.start();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
