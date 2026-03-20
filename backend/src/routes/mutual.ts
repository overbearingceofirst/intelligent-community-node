import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as mutualController from "../controllers/mutualController";

const router = Router();
router.use(authMiddleware);

router.get("/list", mutualController.list);
router.put("/audit", mutualController.audit);
router.put("/complete", mutualController.complete);
router.delete("/:ids", mutualController.remove);

export default router;
