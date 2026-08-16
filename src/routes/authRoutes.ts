import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  registerUser,
);
router.post("/login", authRateLimiter, validate(loginSchema), loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);

export default router;
