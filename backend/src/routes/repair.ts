import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as repairController from "../controllers/repairController";

const router = Router();
router.use(authMiddleware);

router.get("/list", repairController.list);
router.get("/stats", repairController.stats);
router.get("/:id", repairController.getById);
router.put("/handle", repairController.handle);
router.delete("/:ids", repairController.remove);

export default router;
