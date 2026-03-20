import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { PointsRule, PointsFlow, PointsExchange, User } from "../models";
import { success, error, page } from "../utils/response";

// 积分兑换说明列表
export async function ruleList(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { communityId } = req.query;
    const where: any = {};

    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (user && (user as any).communityId) {
        where.communityId = (user as any).communityId;
      } else {
        return success(res, []);
      }
    } else if (communityId) {
      where.communityId = Number(communityId);
    }

    const rules = await PointsRule.findAll({
      where,
      order: [
        ["sort", "ASC"],
        ["id", "ASC"],
      ],
    });
    return success(res, rules);
  } catch (err) {
    next(err);
  }
}

// 创建积分兑换说明
export async function ruleCreate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { communityId, title, content, sort } = req.body;

    if (!title) return error(res, "请输入标题", 400);
    if (!content) return error(res, "请输入说明内容", 400);

    let finalCommunityId = communityId;

    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (!user || !(user as any).communityId) {
        return error(res, "您尚未绑定小区", 400);
      }
      finalCommunityId = (user as any).communityId;
    } else {
      if (!communityId) return error(res, "请选择小区", 400);
    }

    await PointsRule.create({
      communityId: finalCommunityId,
      title,
      content,
      sort: sort || 0,
      status: 1,
    });

    return success(res, null, "新增成功");
  } catch (err) {
    next(err);
  }
}

// 修改积分兑换说明
export async function ruleUpdate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, title, content, sort, status } = req.body;

    const rule = await PointsRule.findByPk(id);
    if (!rule) return error(res, "记录不存在", 404);

    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (!user || (user as any).communityId !== rule.communityId) {
        return error(res, "无权限修改", 403);
      }
    }

    await rule.update({ title, content, sort, status });
    return success(res, null, "修改成功");
  } catch (err) {
    next(err);
  }
}

// 删除积分规则
export async function ruleDelete(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ids = req.params.ids.split(",").map(Number);

    // 物业管理员只能删除自己绑定小区的规则
    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (user && (user as any).communityId) {
        const rules = await PointsRule.findAll({ where: { id: ids } });
        const hasOther = rules.some(
          (r) => r.communityId !== (user as any).communityId,
        );
        if (hasOther) {
          return error(res, "无权限删除其他小区的规则", 403);
        }
      }
    }

    await PointsRule.destroy({ where: { id: ids } });
    return success(res, null, "删除成功");
  } catch (err) {
    next(err);
  }
}

export async function flowList(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pageNum = 1, pageSize = 10, residentId, type } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const where: any = {};
    if (residentId) where.residentId = Number(residentId);
    if (type) where.type = Number(type);
    const { count, rows } = await PointsFlow.findAndCountAll({
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

// 积分兑换商品列表
export async function exchangeList(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pageNum = 1, pageSize = 10, name, status, communityId } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const where: any = {};

    // 物业管理员只能看到自己绑定小区的商品
    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (user && (user as any).communityId) {
        where.communityId = (user as any).communityId;
      } else {
        return page(res, [], 0);
      }
    } else if (communityId) {
      where.communityId = Number(communityId);
    }

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (status !== undefined && status !== "") where.status = Number(status);

    const { count, rows } = await PointsExchange.findAndCountAll({
      where,
      offset,
      limit: Number(pageSize),
      order: [["id", "DESC"]],
    });
    return page(res, rows, count);
  } catch (err) {
    next(err);
  }
}

// 获取单个兑换商品
export async function exchangeGet(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const item = await PointsExchange.findByPk(id);
    if (!item) return error(res, "商品不存在", 404);
    return success(res, item);
  } catch (err) {
    next(err);
  }
}

// 创建兑换商品
export async function exchangeCreate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { communityId, name, description, image, points, stock } = req.body;

    if (!name) return error(res, "请输入商品名称", 400);
    if (!points || points <= 0) return error(res, "请输入有效的积分值", 400);

    let finalCommunityId = communityId;

    // 物业管理员只能在自己绑定的小区下创建
    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (!user || !(user as any).communityId) {
        return error(res, "您尚未绑定小区", 400);
      }
      finalCommunityId = (user as any).communityId;
    } else {
      if (!communityId) return error(res, "请选择小区", 400);
    }

    await PointsExchange.create({
      communityId: finalCommunityId,
      name,
      description,
      image,
      points,
      stock: stock || 0,
      exchangedCount: 0,
      status: 1,
    });

    return success(res, null, "新增成功");
  } catch (err) {
    next(err);
  }
}

// 修改兑换商品
export async function exchangeUpdate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, name, description, image, points, stock, status } = req.body;

    const item = await PointsExchange.findByPk(id);
    if (!item) return error(res, "商品不存在", 404);

    // 物业管理员只能修改自己绑定小区的商品
    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (!user || (user as any).communityId !== item.communityId) {
        return error(res, "无权限修改该商品", 403);
      }
    }

    await item.update({ name, description, image, points, stock, status });
    return success(res, null, "修改成功");
  } catch (err) {
    next(err);
  }
}

// 删除兑换商品
export async function exchangeDelete(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ids = req.params.ids.split(",").map(Number);

    // 物业管理员只能删除自己绑定小区的商品
    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (user && (user as any).communityId) {
        const items = await PointsExchange.findAll({ where: { id: ids } });
        const hasOther = items.some(
          (i) => i.communityId !== (user as any).communityId,
        );
        if (hasOther) {
          return error(res, "无权限删除其他小区的商品", 403);
        }
      }
    }

    await PointsExchange.destroy({ where: { id: ids } });
    return success(res, null, "删除成功");
  } catch (err) {
    next(err);
  }
}

// 修改商品状态（上架/下架）
export async function exchangeChangeStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, status } = req.body;

    const item = await PointsExchange.findByPk(id);
    if (!item) return error(res, "商品不存在", 404);

    // 物业管理员只能修改自己绑定小区的商品
    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (!user || (user as any).communityId !== item.communityId) {
        return error(res, "无权限修改该商品", 403);
      }
    }

    await item.update({ status });
    return success(res, null, status === 1 ? "已上架" : "已下架");
  } catch (err) {
    next(err);
  }
}
