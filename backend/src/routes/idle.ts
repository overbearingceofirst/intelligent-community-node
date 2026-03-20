import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as idleController from "../controllers/idleController";

const router = Router();
router.use(authMiddleware);

router.get("/list", idleController.list);
router.put("/audit", idleController.audit);
router.put("/status", idleController.changeStatus);
router.delete("/:ids", idleController.remove);

export default router;
