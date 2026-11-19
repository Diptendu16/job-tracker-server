import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireWorkspaceMembership } from "../middleware/workspaceAuth.js";
import { validateQuery } from "../middleware/validate.js";
import { activityQuerySchema } from "../validators/activityValidators.js";
import {
  listActivityHandler,
  clearActivityHandler,
} from "../controllers/activityController.js";

const router = Router({ mergeParams: true });

router.use(protect, requireWorkspaceMembership);
router.get("/", validateQuery(activityQuerySchema), listActivityHandler);
router.post("/clear", clearActivityHandler);

export default router;
