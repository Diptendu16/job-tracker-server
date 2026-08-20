import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireWorkspaceMembership } from "../middleware/workspaceAuth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  createApplicationSchema,
  updateApplicationSchema,
  applicationQuerySchema,
} from "../validators/applicationValidators.js";
import {
  listApplicationsHandler,
  getApplicationHandler,
  createApplicationHandler,
  updateApplicationHandler,
  deleteApplicationHandler,
} from "../controllers/applicationController.js";

const router = Router({ mergeParams: true }); // mergeParams lets us read :workspaceId from the parent route

router.use(protect, requireWorkspaceMembership);

router.get("/", validateQuery(applicationQuerySchema), listApplicationsHandler);
router.post("/", validate(createApplicationSchema), createApplicationHandler);
router.get("/:id", validateObjectId("id"), getApplicationHandler);
router.patch(
  "/:id",
  validateObjectId("id"),
  validate(updateApplicationSchema),
  updateApplicationHandler,
);
router.delete("/:id", validateObjectId("id"), deleteApplicationHandler);

export default router;
