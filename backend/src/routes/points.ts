import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as pointsController from "../controllers/pointsController";

const router = Router();
router.use(authMiddleware);

// 积分规则（移除 requireRole，改为控制器内部判断权限）
router.get("/rule/list", pointsController.ruleList);
router.post("/rule", pointsController.ruleCreate);
router.put("/rule", pointsController.ruleUpdate);
router.delete("/rule/:ids", pointsController.ruleDelete);

// 积分流水
router.get("/flow/list", pointsController.flowList);

// 积分兑换商品
router.get("/exchange/list", pointsController.exchangeList);
router.get("/exchange/:id", pointsController.exchangeGet);
router.post("/exchange", pointsController.exchangeCreate);
router.put("/exchange", pointsController.exchangeUpdate);
router.put("/exchange/status", pointsController.exchangeChangeStatus);
router.delete("/exchange/:ids", pointsController.exchangeDelete);

export default router;
