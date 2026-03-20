import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as paymentController from "../controllers/paymentController";

const router = Router();
router.use(authMiddleware);

// 缴费项目
router.get("/item/list", paymentController.itemList);
router.post("/item", paymentController.itemCreate);
router.put("/item", paymentController.itemUpdate);
router.delete("/item/:ids", paymentController.itemRemove);

// 账单
router.get("/bill/list", paymentController.billList);
router.post("/bill", paymentController.billCreate);
router.put("/bill/status", paymentController.billChangeStatus);
router.delete("/bill/:ids", paymentController.billRemove);

export default router;
