import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireWorkspaceMembership } from "../middleware/workspaceAuth.js";
import { validateQuery } from "../middleware/validate.js";
import { activityQuerySchema } from "../validators/activityValidators.js";
import { listActivityHandler } from "../controllers/activityController.js";

const router = Router({ mergeParams: true });

router.use(protect, requireWorkspaceMembership);
router.get("/", validateQuery(activityQuerySchema), listActivityHandler);

export default router;
