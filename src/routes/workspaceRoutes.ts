import { Router } from "express";
import applicationRoutes from "./applicationRoutes.js";

const router = Router();

router.use("/:workspaceId/applications", applicationRoutes);

export default router;
