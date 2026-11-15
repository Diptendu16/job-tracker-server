import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getInviteDetailsHandler,
  acceptInviteHandler,
} from "../controllers/inviteController.js";

const router = Router();

router.get("/:token", protect, getInviteDetailsHandler);
router.post("/:token/accept", protect, acceptInviteHandler);

export default router;
