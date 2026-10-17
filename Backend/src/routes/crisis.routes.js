
import { Router } from "express";

import {
  createCrisis,
  getCrises,
  getCrisisById,
  updateCrisis,
  deactivateCrisis,
} from "../controllers/crisis.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  createCrisisSchema,
  updateCrisisSchema,
} from "../validators/crisis.validator.js";

const router = Router();

// Public: view active crisis types
router.get("/", getCrises);
router.get("/:crisisId", getCrisisById);

// Admin-only: manage crisis types
router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validate(createCrisisSchema),
  createCrisis
);

router.patch(
  "/:crisisId",
  authenticate,
  authorizeRoles("admin"),
  validate(updateCrisisSchema),
  updateCrisis
);

router.patch(
  "/:crisisId/deactivate",
  authenticate,
  authorizeRoles("admin"),
  deactivateCrisis
);

export default router;