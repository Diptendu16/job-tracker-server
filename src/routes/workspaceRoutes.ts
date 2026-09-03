import { Router } from "express";
import applicationRoutes from "./applicationRoutes.js";
import resumeVersionRoutes from "./resumeVersionRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";

const router = Router();

router.use("/:workspaceId/applications", applicationRoutes);
router.use("/:workspaceId/resume-versions", resumeVersionRoutes);
router.use("/:workspaceId/analytics", analyticsRoutes);

export default router;
