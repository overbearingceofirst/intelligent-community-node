import { Request, Response, NextFunction } from "express";
import { Op, fn, col, literal } from "sequelize";
import {
  Resident,
  Repair,
  MutualHelp,
  Notice,
  PaymentBill,
  sequelize,
} from "../models";
import { success } from "../utils/response";

// 获取统计数据
export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // 总居民数
    const totalResidents = await Resident.count();

    // 已认证居民数
    const authResidents = await Resident.count({ where: { authStatus: 2 } });

    // 待处理报修
    const pendingRepairs = await Repair.count({ where: { status: 0 } });

    // 本月互助数
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyMutual = await MutualHelp.count({
      where: { createdAt: { [Op.gte]: startOfMonth } },
    });

    // 今日公告数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayNotices = await Notice.count({
      where: { publishTime: { [Op.gte]: today }, status: 1 },
    });

    // 本月缴费总额
    const monthlyPayment =
      (await PaymentBill.sum("amount", {
        where: { status: 1, payTime: { [Op.gte]: startOfMonth } },
      })) || 0;

    return success(res, {
      totalResidents,
      authResidents,
      pendingRepairs,
      monthlyMutual,
      todayNotices,
      monthlyPayment: Number(monthlyPayment).toFixed(2),
    });
  } catch (err) {
    next(err);
  }
}

// 获取近30天报修趋势（柱状图）
export async function getRepairTrend(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const days = 30;
    const result: { date: string; count: number }[] = [];

    // 生成近30天日期
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await Repair.count({
        where: {
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
        },
      });

      result.push({ date: dateStr.substring(5), count }); // MM-DD 格式
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

// 获取近30天互助趋势（折线图）
export async function getMutualTrend(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const days = 30;
    const result: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await MutualHelp.count({
        where: {
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
        },
      });

      result.push({ date: dateStr.substring(5), count });
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

// 获取待处理报修列表
export async function getPendingRepairs(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const repairs = await Repair.findAll({
      where: { status: 0 },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
    return success(res, repairs);
  } catch (err) {
    next(err);
  }
}

// 获取待审核居民列表
export async function getPendingResidents(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const residents = await Resident.findAll({
      where: { authStatus: 1 },
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
    return success(res, residents);
  } catch (err) {
    next(err);
  }
}
