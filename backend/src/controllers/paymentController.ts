import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { PaymentItem, PaymentBill } from "../models";
import { success, error, page } from "../utils/response";

// 缴费项目
export async function itemList(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pageNum = 1, pageSize = 10, name, status } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const where: any = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (status !== undefined && status !== "") where.status = Number(status);
    const { count, rows } = await PaymentItem.findAndCountAll({
      where,
      offset,
      limit: Number(pageSize),
      order: [["id", "ASC"]],
    });
    return page(res, rows, count);
  } catch (err) {
    next(err);
  }
}

export async function itemCreate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, code, unit, price, remark } = req.body;
    await PaymentItem.create({ name, code, unit, price, remark, status: 1 });
    return success(res, null, "新增成功");
  } catch (err) {
    next(err);
  }
}

export async function itemUpdate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, name, unit, price, status, remark } = req.body;
    const item = await PaymentItem.findByPk(id);
    if (!item) return error(res, "项目不存在", 404);
    await item.update({ name, unit, price, status, remark });
    return success(res, null, "修改成功");
  } catch (err) {
    next(err);
  }
}

export async function itemRemove(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ids = req.params.ids.split(",").map(Number);
    await PaymentItem.destroy({ where: { id: ids } });
    return success(res, null, "删除成功");
  } catch (err) {
    next(err);
  }
}

// 账单
export async function billList(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      pageNum = 1,
      pageSize = 10,
      residentId,
      itemId,
      status,
      billMonth,
    } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const where: any = {};
    if (residentId) where.residentId = Number(residentId);
    if (itemId) where.itemId = Number(itemId);
    if (status !== undefined && status !== "") where.status = Number(status);
    if (billMonth) where.billMonth = billMonth;
    const { count, rows } = await PaymentBill.findAndCountAll({
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

export async function billCreate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { residentId, itemId, amount, billMonth, remark } = req.body;
    await PaymentBill.create({
      residentId,
      itemId,
      amount,
      billMonth,
      remark,
      status: 0,
    });
    return success(res, null, "新增成功");
  } catch (err) {
    next(err);
  }
}

export async function billChangeStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, status } = req.body;
    const bill = await PaymentBill.findByPk(id);
    if (!bill) return error(res, "账单不存在", 404);
    await bill.update({ status, payTime: status === 1 ? new Date() : null });
    return success(res, null, "操作成功");
  } catch (err) {
    next(err);
  }
}

export async function billRemove(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ids = req.params.ids.split(",").map(Number);
    await PaymentBill.destroy({ where: { id: ids } });
    return success(res, null, "删除成功");
  } catch (err) {
    next(err);
  }
}
