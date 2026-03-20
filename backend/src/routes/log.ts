import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { OperationLog } from "../models";
import { success, page } from "../utils/response";
import { Op } from "sequelize";

const router = Router();
router.use(authMiddleware);

router.get("/operlog/list", async (req, res, next) => {
  try {
    const { pageNum = 1, pageSize = 10, title, operName, status } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const where: any = {};
    if (title) where.title = { [Op.like]: `%${title}%` };
    if (operName) where.operName = { [Op.like]: `%${operName}%` };
    if (status !== undefined && status !== "") where.status = Number(status);
    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      offset,
      limit: Number(pageSize),
      order: [["operTime", "DESC"]],
    });
    return page(res, rows, count);
  } catch (err) {
    next(err);
  }
});

router.delete("/operlog/:ids", async (req, res, next) => {
  try {
    const ids = req.params.ids.split(",").map(Number);
    await OperationLog.destroy({ where: { id: ids } });
    return success(res, null, "删除成功");
  } catch (err) {
    next(err);
  }
});

router.delete("/operlog/clean", async (req, res, next) => {
  try {
    await OperationLog.destroy({ where: {}, truncate: true });
    return success(res, null, "清空成功");
  } catch (err) {
    next(err);
  }
});

export default router;
