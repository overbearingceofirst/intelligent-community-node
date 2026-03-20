import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as settingController from "../controllers/settingController";

const router = Router();
router.use(authMiddleware);

// 小区管理
router.get("/community/list", settingController.listCommunity);
router.get("/community/options", settingController.getCommunityOptions);
router.get("/community/:id?", settingController.getCommunity);
router.post("/community", settingController.createCommunity);
router.put("/community", settingController.updateCommunity);
router.delete("/community/:ids", settingController.deleteCommunity);

// 楼栋管理（移除 requireRole，改为控制器内部判断权限）
router.get("/building/list", settingController.buildingList);
router.get("/building/tree", settingController.buildingTree);
router.post("/building", settingController.buildingCreate);
router.put("/building", settingController.buildingUpdate);
router.delete("/building/:ids", settingController.buildingRemove);

export default router;
