/**
 * 请求日志中间件
 * 记录每个请求的基本信息
 */
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // 响应完成后记录日志
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "warn" : "info";

    logger[logLevel](
      `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`,
      {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get("User-Agent"),
        user: req.user?.username,
      },
    );
  });

  next();
}
