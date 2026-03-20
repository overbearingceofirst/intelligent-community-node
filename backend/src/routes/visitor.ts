import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as visitorController from "../controllers/visitorController";

const router = Router();
router.use(authMiddleware);

router.get("/list", visitorController.list);
router.put("/verify", visitorController.verify);

export default router;
