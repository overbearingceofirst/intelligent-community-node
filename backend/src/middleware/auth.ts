/**
 * JWT 认证中间件
 * 验证请求头中的 Token，解析用户信息
 */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        roleId?: number;
        roleCodes?: string[];
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * JWT 验证中间件
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ code: 401, msg: "未登录或登录已过期" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      roleId?: number;
      roleCodes?: string[];
    };
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ code: 401, msg: "登录已过期，请重新登录" });
    }
    return res.status(401).json({ code: 401, msg: "无效的Token" });
  }
}

/**
 * 角色权限验证中间件
 * @param roles 允许访问的角色编码数组
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ code: 401, msg: "请先登录" });
    }

    // 超级管理员拥有所有权限
    if (req.user.roleCodes?.includes("admin")) {
      return next();
    }

    // 检查用户角色是否在允许列表中
    const hasRole = req.user.roleCodes?.some((code) => roles.includes(code));
    if (!hasRole) {
      return res.status(403).json({ code: 403, msg: "没有操作权限" });
    }

    next();
  };
}

/**
 * 权限标识验证中间件
 * @param perms 权限标识字符串
 */
export function hasPermission(perms: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ code: 401, msg: "请先登录" });
    }
    // 超级管理员跳过权限检查
    if (req.user.roleCodes?.includes("admin")) {
      return next();
    }
    // TODO: 实际项目中需要查询用户权限列表进行比对
    next();
  };
}
