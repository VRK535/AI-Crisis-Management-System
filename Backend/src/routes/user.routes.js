
import { Router } from "express";
import {
  getProfile,
  updateProfile,
} from "../controllers/user.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { updateUserSchema } from "../validators/user.validator.js";

const router = Router();

// All routes below require authentication
router.use(authenticate);

// GET /api/v1/users/profile
router.get("/profile", getProfile);

// PATCH /api/v1/users/profile
router.patch(
  "/profile",
  validate(updateUserSchema),
  updateProfile
);

export default router;