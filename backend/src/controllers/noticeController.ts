import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { Notice } from "../models";
import { success, error, page } from "../utils/response";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { pageNum = 1, pageSize = 10, title, type, status } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const where: any = {};
    if (title) where.title = { [Op.like]: `%${title}%` };
    if (type) where.type = Number(type);
    if (status !== undefined && status !== "") where.status = Number(status);
    const { count, rows } = await Notice.findAndCountAll({
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
    const notice = await Notice.findByPk(req.params.id);
    if (!notice) return error(res, "公告不存在", 404);
    return success(res, notice);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content, type, targetBuildings } = req.body;
    await Notice.create({
      title,
      content,
      type,
      targetBuildings: JSON.stringify(targetBuildings || []),
      publisherId: req.user!.id,
      status: 0,
      readCount: 0,
    });
    return success(res, null, "新增成功");
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, title, content, type, targetBuildings } = req.body;
    const notice = await Notice.findByPk(id);
    if (!notice) return error(res, "公告不存在", 404);
    await notice.update({
      title,
      content,
      type,
      targetBuildings: JSON.stringify(targetBuildings || []),
    });
    return success(res, null, "修改成功");
  } catch (err) {
    next(err);
  }
}

export async function publish(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, status } = req.body;
    const notice = await Notice.findByPk(id);
    if (!notice) return error(res, "公告不存在", 404);
    await notice.update({
      status,
      publishTime: status === 1 ? new Date() : null,
    });
    return success(res, null, status === 1 ? "发布成功" : "已下架");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = req.params.ids.split(",").map(Number);
    await Notice.destroy({ where: { id: ids } });
    return success(res, null, "删除成功");
  } catch (err) {
    next(err);
  }
}
