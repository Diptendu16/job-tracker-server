import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireWorkspaceMembership } from "../middleware/workspaceAuth.js";
import { getAnalyticsHandler } from "../controllers/analyticsController.js";

const router = Router({ mergeParams: true });

router.use(protect, requireWorkspaceMembership);
router.get("/", getAnalyticsHandler);

export default router;
