import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { IdleItem } from "../models";
import { success, error, page } from "../utils/response";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { pageNum = 1, pageSize = 10, title, status } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const where: any = {};
    if (title) where.title = { [Op.like]: `%${title}%` };
    if (status !== undefined && status !== "") where.status = Number(status);
    const { count, rows } = await IdleItem.findAndCountAll({
      where,
      offset,
      limit: Number(pageSize),
      order: [["createdAt", "DESC"]],
    });
    return page(res, rows, count);
  } catch (err) {
    next(err);
  }
}

export async function audit(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, status, auditNote } = req.body;
    const item = await IdleItem.findByPk(id);
    if (!item) return error(res, "物品不存在", 404);
    await item.update({ status, auditNote });
    return success(res, null, status === 1 ? "审核通过" : "已驳回");
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
    const item = await IdleItem.findByPk(id);
    if (!item) return error(res, "物品不存在", 404);
    await item.update({ status });
    return success(res, null, "操作成功");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = req.params.ids.split(",").map(Number);
    await IdleItem.destroy({ where: { id: ids } });
    return success(res, null, "删除成功");
  } catch (err) {
    next(err);
  }
}
