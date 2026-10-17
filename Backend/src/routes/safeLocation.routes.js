import { Router } from "express";
import {
  getNearbySafeLocations,
  getOfflineSafeZones,
  getSafeLocations,
  getSafeLocationById,
  createSafeLocation,
  updateSafeLocation,
  updateOccupancy,
  deleteSafeLocation,
} from "../controllers/safeLocation.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  createSafeLocationSchema,
  updateSafeLocationSchema,
  updateOccupancySchema,
} from "../validators/safeLocation.validator.js";

const router = Router();

// Public / Citizen routes: view nearby shelters & download offline cache
router.get("/nearby", getNearbySafeLocations);
router.get("/offline-cache", getOfflineSafeZones);
router.get("/", getSafeLocations);
router.get("/:locationId", getSafeLocationById);

// Responder / Admin route: update live occupancy
router.patch(
  "/:locationId/occupancy",
  authenticate,
  authorizeRoles("admin", "responder"),
  validate(updateOccupancySchema),
  updateOccupancy
);

// Admin-only: manage safe locations
router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validate(createSafeLocationSchema),
  createSafeLocation
);

router.patch(
  "/:locationId",
  authenticate,
  authorizeRoles("admin"),
  validate(updateSafeLocationSchema),
  updateSafeLocation
);

router.delete(
  "/:locationId",
  authenticate,
  authorizeRoles("admin"),
  deleteSafeLocation
);

export default router;

