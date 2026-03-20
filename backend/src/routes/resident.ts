/**
 * 居民管理路由
 */
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as residentController from "../controllers/residentController";

const router = Router();
router.use(authMiddleware);

router.get("/list", residentController.list);
router.get("/:id", residentController.getById);
router.put("/status", residentController.changeStatus);
router.put("/resetPwd", residentController.resetPwd);
router.put("/auditAuth", residentController.auditAuth);
router.put("/auditBind", residentController.auditBind);
router.delete("/:ids", residentController.remove);

export default router;
