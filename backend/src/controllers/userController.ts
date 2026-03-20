/**
 * 用户管理控制器
 */
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { User, Role } from "../models";
import { success, error, page } from "../utils/response";
import { exportExcel } from "../utils/excel";

/**
 * 用户列表（分页）
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      pageNum = 1,
      pageSize = 10,
      userName,
      phonenumber,
      status,
    } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);

    const where: any = { delFlag: 0 };
    if (userName) where.username = { [Op.like]: `%${userName}%` };
    if (phonenumber) where.phone = { [Op.like]: `%${phonenumber}%` };
    if (status !== undefined && status !== "") where.status = Number(status);

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      offset,
      limit: Number(pageSize),
      order: [["createdAt", "DESC"]],
    });

    return page(res, rows, count);
  } catch (err) {
    next(err);
  }
}

/**
 * 用户详情
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return error(res, "用户不存在", 404);
    }

    // 查询所有角色供选择
    const roles = await Role.findAll({ where: { status: 1 } });

    return success(res, { data: user, roles });
  } catch (err) {
    next(err);
  }
}

/**
 * 新增用户
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      userName,
      nickName,
      password,
      phonenumber,
      email,
      sex,
      roleId,
      communityId, // 新增：绑定小区
      status,
      remark,
    } = req.body;

    if (!userName || !password) {
      return error(res, "用户名和密码不能为空", 400);
    }

    // 检查用户名是否存在
    const existing = await User.findOne({ where: { username: userName } });
    if (existing) {
      return error(res, "用户名已存在", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username: userName,
      password: hashedPassword,
      nickname: nickName || userName,
      phone: phonenumber,
      email,
      sex,
      roleId,
      communityId, // 新增：绑定小区
      status: status ?? 1,
      delFlag: 0,
      remark,
    });

    return success(res, null, "新增成功");
  } catch (err) {
    next(err);
  }
}

/**
 * 修改用户
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      userId,
      nickName,
      phonenumber,
      email,
      sex,
      roleId,
      communityId, // 新增：绑定小区
      status,
      remark,
    } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return error(res, "用户不存在", 404);
    }

    await user.update({
      nickname: nickName,
      phone: phonenumber,
      email,
      sex,
      roleId,
      communityId, // 新增：绑定小区
      status,
      remark,
    });

    return success(res, null, "修改成功");
  } catch (err) {
    next(err);
  }
}

/**
 * 删除用户（逻辑删除）
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const { ids } = req.params;
    const idArray = ids.split(",").map(Number);

    // 不允许删除 admin
    const adminUser = await User.findOne({
      where: { username: "admin", id: idArray },
    });
    if (adminUser) {
      return error(res, "不允许删除超级管理员", 403);
    }

    await User.update({ delFlag: 1 }, { where: { id: idArray } });

    return success(res, null, "删除成功");
  } catch (err) {
    next(err);
  }
}

/**
 * 重置密码
 */
export async function resetPwd(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, password } = req.body;

    if (!password) {
      return error(res, "密码不能为空", 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return error(res, "用户不存在", 404);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({ password: hashedPassword });

    return success(res, null, "重置成功");
  } catch (err) {
    next(err);
  }
}

/**
 * 修改状态
 */
export async function changeStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, status } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return error(res, "用户不存在", 404);
    }

    if (user.username === "admin") {
      return error(res, "不允许停用超级管理员", 403);
    }

    await user.update({ status });

    return success(res, null, status === 1 ? "启用成功" : "停用成功");
  } catch (err) {
    next(err);
  }
}

/**
 * 导出用户
 */
export async function exportExcelHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await User.findAll({
      where: { delFlag: 0 },
      attributes: { exclude: ["password"] },
    });

    exportExcel(
      res,
      users.map((u) => u.toJSON()),
      [
        { header: "用户ID", key: "id", width: 10 },
        { header: "用户名", key: "username", width: 15 },
        { header: "昵称", key: "nickname", width: 15 },
        { header: "邮箱", key: "email", width: 25 },
        { header: "手机号", key: "phone", width: 15 },
        { header: "状态", key: "status", width: 10 },
      ],
      "用户数据",
    );
  } catch (err) {
    next(err);
  }
}

// 导出别名
export { exportExcelHandler as exportExcel };
