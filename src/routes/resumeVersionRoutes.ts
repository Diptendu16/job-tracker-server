import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireWorkspaceMembership } from "../middleware/workspaceAuth.js";
import { validate } from "../middleware/validate.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { createResumeVersionSchema } from "../validators/resumeVersionValidators.js";
import {
  listResumeVersionsHandler,
  createResumeVersionHandler,
  deleteResumeVersionHandler,
} from "../controllers/resumeVersionController.js";

const router = Router({ mergeParams: true });

router.use(protect, requireWorkspaceMembership);

router.get("/", listResumeVersionsHandler);
router.post(
  "/",
  validate(createResumeVersionSchema),
  createResumeVersionHandler,
);
router.delete("/:id", validateObjectId("id"), deleteResumeVersionHandler);

export default router;
