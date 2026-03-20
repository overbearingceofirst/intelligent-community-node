import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { Visitor } from "../models";
import { success, error, page } from "../utils/response";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      pageNum = 1,
      pageSize = 10,
      visitorName,
      residentId,
      status,
    } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const where: any = {};
    if (visitorName) where.visitorName = { [Op.like]: `%${visitorName}%` };
    if (residentId) where.residentId = Number(residentId);
    if (status !== undefined && status !== "") where.status = Number(status);
    const { count, rows } = await Visitor.findAndCountAll({
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

export async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.body;
    const visitor = await Visitor.findByPk(id);
    if (!visitor) return error(res, "访客不存在", 404);
    await visitor.update({
      status: 1,
      verifyTime: new Date(),
      verifierId: req.user?.id,
    });
    return success(res, null, "核验成功");
  } catch (err) {
    next(err);
  }
}
