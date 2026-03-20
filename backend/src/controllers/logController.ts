import { Request, Response, NextFunction } from "express";
import { OperationLog } from "../models";
import { Op } from "sequelize";

export async function listLogs(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page = 1, pageSize = 10, username, action } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    const where: any = {};
    if (username) where.username = { [Op.like]: `%${username}%` };
    if (action) where.action = { [Op.like]: `%${action}%` };

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      offset,
      limit: Number(pageSize),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      code: 200,
      msg: "操作成功",
      data: { total: count, list: rows },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteLogs(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { ids } = req.body; // 数组
    if (!ids || !ids.length) {
      return res.status(400).json({ code: 400, msg: "请选择要删除的日志" });
    }
    await OperationLog.destroy({ where: { id: ids } });
    res.json({ code: 200, msg: "删除成功" });
  } catch (error) {
    next(error);
  }
}
