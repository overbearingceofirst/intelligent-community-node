/**
 * 居民管理控制器
 */
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { Resident } from "../models";
import { success, error, page } from "../utils/response";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      pageNum = 1,
      pageSize = 10,
      username,
      phone,
      authStatus,
      bindStatus,
      status,
    } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const where: any = {};
    if (username) where.username = { [Op.like]: `%${username}%` };
    if (phone) where.phone = { [Op.like]: `%${phone}%` };
    if (authStatus !== undefined && authStatus !== "")
      where.authStatus = Number(authStatus);
    if (bindStatus !== undefined && bindStatus !== "")
      where.bindStatus = Number(bindStatus);
    if (status !== undefined && status !== "") where.status = Number(status);

    const { count, rows } = await Resident.findAndCountAll({
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

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const resident = await Resident.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    if (!resident) return error(res, "居民不存在", 404);
    return success(res, resident);
  } catch (err) {
    next(err);
  }
}

export async function changeStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, status } = req.body;
    const resident = await Resident.findByPk(id);
    if (!resident) return error(res, "居民不存在", 404);
    await resident.update({ status });
    return success(res, null, status === 1 ? "启用成功" : "禁用成功");
  } catch (err) {
    next(err);
  }
}

export async function resetPwd(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, password } = req.body;
    if (!password) return error(res, "密码不能为空", 400);
    const resident = await Resident.findByPk(id);
    if (!resident) return error(res, "居民不存在", 404);
    const hashed = await bcrypt.hash(password, 10);
    await resident.update({ password: hashed });
    return success(res, null, "重置成功");
  } catch (err) {
    next(err);
  }
}

export async function auditAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, authStatus, remark } = req.body;
    const resident = await Resident.findByPk(id);
    if (!resident) return error(res, "居民不存在", 404);
    await resident.update({ authStatus });
    return success(res, null, authStatus === 2 ? "审核通过" : "已驳回");
  } catch (err) {
    next(err);
  }
}

export async function auditBind(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, bindStatus, remark } = req.body;
    const resident = await Resident.findByPk(id);
    if (!resident) return error(res, "居民不存在", 404);
    await resident.update({ bindStatus });
    return success(res, null, bindStatus === 2 ? "绑定通过" : "已驳回");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = req.params.ids.split(",").map(Number);
    await Resident.destroy({ where: { id: ids } });
    return success(res, null, "删除成功");
  } catch (err) {
    next(err);
  }
}
