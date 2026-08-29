import { Router } from "express";
import applicationRoutes from "./applicationRoutes.js";
import resumeVersionRoutes from "./resumeVersionRoutes.js";

const router = Router();

router.use("/:workspaceId/applications", applicationRoutes);
router.use("/:workspaceId/resume-versions", resumeVersionRoutes);

export default router;
