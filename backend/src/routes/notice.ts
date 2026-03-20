import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as noticeController from "../controllers/noticeController";

const router = Router();
router.use(authMiddleware);

router.get("/list", noticeController.list);
router.get("/:id", noticeController.getById);
router.post("/", noticeController.create);
router.put("/", noticeController.update);
router.put("/publish", noticeController.publish);
router.delete("/:ids", noticeController.remove);

export default router;
