import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { Menu } from "../models";
import { success, error } from "../utils/response";

const router = Router();
router.use(authMiddleware);

router.get("/list", async (req, res, next) => {
  try {
    const menus = await Menu.findAll({
      where: { status: 1 },
      order: [["orderNum", "ASC"]],
    });
    return success(res, menus);
  } catch (err) {
    next(err);
  }
});

router.get("/treeselect", async (req, res, next) => {
  try {
    const menus = await Menu.findAll({
      where: { status: 1 },
      order: [["orderNum", "ASC"]],
    });
    // 构建树形结构
    const tree = buildTree(
      menus.map((m) => m.toJSON()),
      0,
    );
    return success(res, tree);
  } catch (err) {
    next(err);
  }
});

function buildTree(list: any[], parentId: number): any[] {
  return list
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      id: item.id,
      label: item.name,
      children: buildTree(list, item.id),
    }));
}

export default router;
