/**
 * 认证控制器
 * 处理登录、获取用户信息、路由配置等
 */
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Role } from "../models";
import { success, error } from "../utils/response";
import { logger } from "../utils/logger";
import menus from "../config/menus.json";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

/**
 * 用户登录
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return error(res, "用户名和密码不能为空", 400);
    }

    // 查询用户
    const user = await User.findOne({ where: { username, delFlag: 0 } });
    if (!user) {
      return error(res, "用户不存在", 400);
    }

    // 检查状态
    if (user.status === 0) {
      return error(res, "账号已被停用", 403);
    }

    // 校验密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error(res, "密码错误", 400);
    }

    // 查询角色
    let roleCodes: string[] = [];
    if (user.roleId) {
      const role = await Role.findByPk(user.roleId);
      if (role) {
        roleCodes = [role.code];
      }
    }

    // 生成 Token
    const token = jwt.sign(
      { id: user.id, username: user.username, roleId: user.roleId, roleCodes },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    // 更新登录信息
    await user.update({
      loginIp: req.ip || req.socket.remoteAddress,
      loginDate: new Date(),
    });

    logger.info(`用户登录成功: ${username}`);

    return success(res, { token }, "登录成功");
  } catch (err) {
    next(err);
  }
}

/**
 * 获取用户信息
 */
export async function getInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return error(res, "未登录", 401);
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return error(res, "用户不存在", 404);
    }

    // 查询角色信息
    let roles: string[] = [];
    let permissions: string[] = ["*:*:*"]; // 默认所有权限

    if (user.roleId) {
      const role = await Role.findByPk(user.roleId);
      if (role) {
        roles = [role.code];
        // 超级管理员拥有所有权限
        if (role.code !== "admin") {
          permissions = []; // TODO: 根据角色查询实际权限
        }
      }
    }

    return success(res, {
      user: {
        userId: user.id,
        userName: user.username,
        nickName: user.nickname,
        email: user.email,
        phonenumber: user.phone,
        sex: user.sex,
        avatar: user.avatar || "",
        admin: roles.includes("admin"),
      },
      roles,
      permissions,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 获取路由配置
 */
export async function getRouters(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  // 返回前端动态路由配置
  return success(res, menus);
}

/**
 * 退出登录
 */
export async function logout(req: Request, res: Response, _next: NextFunction) {
  logger.info(`用户退出登录: ${req.user?.username}`);
  return success(res, null, "退出成功");
}
