/**
 * 全局错误处理中间件
 * 统一捕获异常并返回规范化响应
 */
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function errorHandler(
  err: Error & { status?: number; code?: number },
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  // 记录错误日志
  logger.error(`[${req.method}] ${req.url} - ${err.message}`, {
    stack: err.stack,
    body: req.body,
    query: req.query,
    user: req.user?.username,
  });

  // 返回错误响应
  const statusCode = err.status || err.code || 500;
  res.status(statusCode >= 100 && statusCode < 600 ? statusCode : 500).json({
    code: statusCode,
    msg: err.message || "服务器内部错误",
    data: null,
  });
}
