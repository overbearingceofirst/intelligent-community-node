import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { Community, Building, User } from "../models";
import { success, error, page } from "../utils/response";

// 获取小区列表
export async function listCommunity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pageNum = 1, pageSize = 10, name, status } = req.query;
    const offset = (Number(pageNum) - 1) * Number(pageSize);
    const where: any = {};

    // 物业管理员只能看到自己绑定的小区
    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (user && (user as any).communityId) {
        where.id = (user as any).communityId;
      } else {
        // 未绑定小区，返回空
        return page(res, [], 0);
      }
    }

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (status !== undefined && status !== "") where.status = Number(status);

    const { count, rows } = await Community.findAndCountAll({
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

// 获取单个小区（物业管理员获取自己绑定的小区）
export async function getCommunity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    // 如果传了id，按id查询
    if (id && id !== "undefined") {
      const community = await Community.findByPk(id);
      if (!community) return error(res, "小区不存在", 404);

      // 物业管理员只能查看自己绑定的小区
      if (req.user && !req.user.roleCodes?.includes("admin")) {
        const user = await User.findByPk(req.user.id);
        if (user && (user as any).communityId !== community.id) {
          return error(res, "无权限查看该小区", 403);
        }
      }
      return success(res, community);
    }

    // 没传id，物业管理员返回自己绑定的小区
    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (user && (user as any).communityId) {
        const community = await Community.findByPk((user as any).communityId);
        return success(res, community);
      }
      return success(res, null);
    }

    // 超级管理员返回第一个小区
    const community = await Community.findOne({ order: [["id", "ASC"]] });
    return success(res, community);
  } catch (err) {
    next(err);
  }
}

// 获取小区下拉选项（用于用户绑定）
export async function getCommunityOptions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const communities = await Community.findAll({
      where: { status: 1 },
      attributes: ["id", "name"],
      order: [["id", "ASC"]],
    });
    return success(res, communities);
  } catch (err) {
    next(err);
  }
}

// 新增小区（仅超级管理员）
export async function createCommunity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, address, phone, logo, description } = req.body;
    if (!name) return error(res, "小区名称不能为空", 400);

    await Community.create({
      name,
      address,
      phone,
      logo,
      description,
      status: 1,
    });
    return success(res, null, "新增成功");
  } catch (err) {
    next(err);
  }
}

// 修改小区（超级管理员可改所有，物业管理员只能改自己绑定的）
export async function updateCommunity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, name, address, phone, logo, description, status } = req.body;

    const community = await Community.findByPk(id);
    if (!community) return error(res, "小区不存在", 404);

    // 物业管理员只能修改自己绑定的小区
    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (user && (user as any).communityId !== community.id) {
        return error(res, "无权限修改该小区", 403);
      }
      // 物业管理员不能修改状态
      await community.update({ name, address, phone, logo, description });
    } else {
      await community.update({
        name,
        address,
        phone,
        logo,
        description,
        status,
      });
    }

    return success(res, null, "保存成功");
  } catch (err) {
    next(err);
  }
}

// 删除小区（仅超级管理员）
export async function deleteCommunity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ids = req.params.ids.split(",").map(Number);

    // 检查是否有用户绑定了这些小区
    const bindUsers = await User.count({ where: { communityId: ids } });
    if (bindUsers > 0) {
      return error(res, "该小区下存在绑定用户，无法删除", 400);
    }

    await Community.destroy({ where: { id: ids } });
    return success(res, null, "删除成功");
  } catch (err) {
    next(err);
  }
}

// 楼栋列表（根据小区筛选）
export async function buildingList(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { communityId } = req.query;
    const where: any = {};

    // 物业管理员只能看到自己绑定小区的楼栋
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

    const buildings = await Building.findAll({
      where,
      order: [
        ["sort", "ASC"],
        ["id", "ASC"],
      ],
    });
    return success(res, buildings);
  } catch (err) {
    next(err);
  }
}

// 楼栋树（根据小区筛选）
export async function buildingTree(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { communityId } = req.query;
    const where: any = { status: 1 };

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

    const buildings = await Building.findAll({
      where,
      order: [["sort", "ASC"]],
    });
    const tree = buildTreeData(
      buildings.map((b) => b.toJSON()),
      0,
    );
    return success(res, tree);
  } catch (err) {
    next(err);
  }
}

function buildTreeData(list: any[], parentId: number): any[] {
  return list
    .filter((i) => i.parentId === parentId)
    .map((i) => ({ ...i, children: buildTreeData(list, i.id) }));
}

// 新增楼栋
export async function buildingCreate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { communityId, name, parentId, type, sort } = req.body;

    if (!communityId) return error(res, "请选择所属小区", 400);
    if (!name) return error(res, "请输入楼栋名称", 400);

    // 物业管理员只能在自己绑定的小区下创建
    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (!user || (user as any).communityId !== communityId) {
        return error(res, "无权限在该小区下创建楼栋", 403);
      }
    }

    await Building.create({
      communityId,
      name,
      parentId: parentId || 0,
      type: type || "building",
      sort: sort || 0,
      status: 1,
    });
    return success(res, null, "新增成功");
  } catch (err) {
    next(err);
  }
}

// 修改楼栋
export async function buildingUpdate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, name, sort, status } = req.body;
    const building = await Building.findByPk(id);
    if (!building) return error(res, "楼栋不存在", 404);

    // 物业管理员只能修改自己绑定小区的楼栋
    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (!user || (user as any).communityId !== building.communityId) {
        return error(res, "无权限修改该楼栋", 403);
      }
    }

    await building.update({ name, sort, status });
    return success(res, null, "修改成功");
  } catch (err) {
    next(err);
  }
}

// 删除楼栋
export async function buildingRemove(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ids = req.params.ids.split(",").map(Number);

    // 物业管理员只能删除自己绑定小区的楼栋
    if (req.user && !req.user.roleCodes?.includes("admin")) {
      const user = await User.findByPk(req.user.id);
      if (user && (user as any).communityId) {
        const buildings = await Building.findAll({ where: { id: ids } });
        const hasOther = buildings.some(
          (b) => b.communityId !== (user as any).communityId,
        );
        if (hasOther) {
          return error(res, "无权限删除其他小区的楼栋", 403);
        }
      }
    }

    await Building.destroy({ where: { id: ids } });
    return success(res, null, "删除成功");
  } catch (err) {
    next(err);
  }
}
