import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireWorkspaceMembership } from "../middleware/workspaceAuth.js";
import applicationRoutes from "./applicationRoutes.js";
import resumeVersionRoutes from "./resumeVersionRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import activityRoutes from "./activityRoutes.js";
import {
  listWorkspacesHandler,
  createInviteHandler,
} from "../controllers/workspaceController.js";

const router = Router();

router.get("/", protect, listWorkspacesHandler);
router.post(
  "/:workspaceId/invites",
  protect,
  requireWorkspaceMembership,
  createInviteHandler,
);

router.use("/:workspaceId/applications", applicationRoutes);
router.use("/:workspaceId/resume-versions", resumeVersionRoutes);
router.use("/:workspaceId/analytics", analyticsRoutes);
router.use("/:workspaceId/activity", activityRoutes);

export default router;
