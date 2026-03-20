import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as dashboardController from "../controllers/dashboardController";

const router = Router();
router.use(authMiddleware);

router.get("/stats", dashboardController.getStats);
router.get("/repair-trend", dashboardController.getRepairTrend);
router.get("/mutual-trend", dashboardController.getMutualTrend);
router.get("/pending-repairs", dashboardController.getPendingRepairs);
router.get("/pending-residents", dashboardController.getPendingResidents);

export default router;
