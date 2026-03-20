import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { MutualHelp, Resident, PointsFlow } from "../models";
import { success, error, page } from "../utils/response";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { pageNum = 1, pageSize = 10, title, status } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const where: any = {};
    if (title) where.title = { [Op.like]: `%${title}%` };
    if (status !== undefined && status !== "") where.status = Number(status);
    const { count, rows } = await MutualHelp.findAndCountAll({
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
    const mutual = await MutualHelp.findByPk(id);
    if (!mutual) return error(res, "互助不存在", 404);
    await mutual.update({ status, auditNote });
    return success(res, null, status === 1 ? "审核通过" : "已驳回");
  } catch (err) {
    next(err);
  }
}

export async function complete(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, points } = req.body;
    const mutual = await MutualHelp.findByPk(id);
    if (!mutual) return error(res, "互助不存在", 404);
    if (!mutual.helperId) return error(res, "无帮助者", 400);

    await mutual.update({ status: 2, points });

    // 发放积分
    if (points > 0) {
      const helper = await Resident.findByPk(mutual.helperId);
      if (helper) {
        const newBalance = helper.points + points;
        await helper.update({ points: newBalance });
        await PointsFlow.create({
          residentId: helper.id,
          type: 1,
          points,
          balance: newBalance,
          remark: "互助奖励",
          relatedId: mutual.id,
        });
      }
    }
    return success(res, null, "完成确认");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = req.params.ids.split(",").map(Number);
    await MutualHelp.destroy({ where: { id: ids } });
    return success(res, null, "删除成功");
  } catch (err) {
    next(err);
  }
}
