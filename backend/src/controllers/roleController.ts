import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { Role } from "../models";
import { success, error, page } from "../utils/response";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { pageNum = 1, pageSize = 10, roleName, status } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);

    const where: any = {};
    if (roleName) where.name = { [Op.like]: `%${roleName}%` };
    if (status !== undefined && status !== "") where.status = Number(status);

    const { count, rows } = await Role.findAndCountAll({
      where,
      offset,
      limit: Number(pageSize),
      order: [["sort", "ASC"]],
    });
    return page(res, rows, count);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return error(res, "角色不存在", 404);
    return success(res, role);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { roleName, roleKey, roleSort, status, menuIds, remark } = req.body;
    await Role.create({
      name: roleName,
      code: roleKey,
      sort: roleSort,
      status,
      menuIds: JSON.stringify(menuIds || []),
      remark,
    });
    return success(res, null, "新增成功");
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { roleId, roleName, roleSort, status, menuIds, remark } = req.body;
    const role = await Role.findByPk(roleId);
    if (!role) return error(res, "角色不存在", 404);
    await role.update({
      name: roleName,
      sort: roleSort,
      status,
      menuIds: JSON.stringify(menuIds || []),
      remark,
    });
    return success(res, null, "修改成功");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = req.params.ids.split(",").map(Number);
    const adminRole = await Role.findOne({
      where: { code: "admin", id: ids },
    });
    if (adminRole) return error(res, "不允许删除超级管理员角色", 403);
    await Role.destroy({ where: { id: ids } });
    return success(res, null, "删除成功");
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
    const { roleId, status } = req.body;
    const role = await Role.findByPk(roleId);
    if (!role) return error(res, "角色不存在", 404);
    await role.update({ status });
    return success(res, null, status === 1 ? "启用成功" : "停用成功");
  } catch (err) {
    next(err);
  }
}
