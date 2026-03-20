import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as roleController from "../controllers/roleController";

const router = Router();
router.use(authMiddleware);

router.get("/list", roleController.list);
router.get("/:id", roleController.getById);
router.post("/", roleController.create);
router.put("/", roleController.update);
router.delete("/:ids", roleController.remove);
router.put("/changeStatus", roleController.changeStatus);

export default router;
