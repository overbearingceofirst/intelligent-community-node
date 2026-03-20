import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { Repair, sequelize } from "../models";
import { success, error, page } from "../utils/response";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { pageNum = 1, pageSize = 10, title, status, buildingId } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const where: any = {};
    if (title) where.title = { [Op.like]: `%${title}%` };
    if (status !== undefined && status !== "") where.status = Number(status);
    if (buildingId) where.buildingId = Number(buildingId);

    const { count, rows } = await Repair.findAndCountAll({
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

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const repair = await Repair.findByPk(req.params.id);
    if (!repair) return error(res, "工单不存在", 404);
    return success(res, repair);
  } catch (err) {
    next(err);
  }
}

export async function handle(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, status, handleNote } = req.body;
    const repair = await Repair.findByPk(id);
    if (!repair) return error(res, "工单不存在", 404);
    await repair.update({
      status,
      handleNote,
      handlerId: req.user?.id,
      handleTime: new Date(),
    });
    return success(res, null, "处理成功");
  } catch (err) {
    next(err);
  }
}

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    const total = await Repair.count();
    const pending = await Repair.count({ where: { status: 0 } });
    const processing = await Repair.count({ where: { status: 1 } });
    const completed = await Repair.count({ where: { status: 2 } });
    return success(res, { total, pending, processing, completed });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = req.params.ids.split(",").map(Number);
    await Repair.destroy({ where: { id: ids } });
    return success(res, null, "删除成功");
  } catch (err) {
    next(err);
  }
}
