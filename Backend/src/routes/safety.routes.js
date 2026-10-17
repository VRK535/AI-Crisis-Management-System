
import { Router } from "express";

import {
  createAdvisory,
  getAdvisories,
  getAdvisoriesByCrisis,
  getAdvisoryById,
  updateAdvisory,
  deactivateAdvisory,
} from "../controllers/safety.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  createSafetyAdvisorySchema,
  updateSafetyAdvisorySchema,
} from "../validators/safety.validator.js";

const router = Router();

// Public routes: read active safety advisories
router.get("/", getAdvisories);
router.get("/crisis/:crisisId", getAdvisoriesByCrisis);
router.get("/:advisoryId", getAdvisoryById);

// Admin-only: manage safety advisories
router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validate(createSafetyAdvisorySchema),
  createAdvisory
);

router.patch(
  "/:advisoryId",
  authenticate,
  authorizeRoles("admin"),
  validate(updateSafetyAdvisorySchema),
  updateAdvisory
);

router.patch(
  "/:advisoryId/deactivate",
  authenticate,
  authorizeRoles("admin"),
  deactivateAdvisory
);

export default router;