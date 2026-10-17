import { Router } from "express";
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  getOperationalDashboard,
} from "../controllers/incident.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  createIncidentSchema,
  updateIncidentStatusSchema,
} from "../validators/incident.validator.js";

const router = Router();

// Operational Dashboard for Authorities / Decision Support
router.get("/dashboard/operational", authenticate, getOperationalDashboard);

// List incidents (public/authenticated)
router.get("/", getIncidents);
router.get("/:incidentId", getIncidentById);

// Submit an incident report (authenticated user or responder)
router.post(
  "/",
  authenticate,
  validate(createIncidentSchema),
  createIncident
);

// Admin or Responder: verify / update status
router.patch(
  "/:incidentId/status",
  authenticate,
  authorizeRoles("admin", "responder"),
  validate(updateIncidentStatusSchema),
  updateIncidentStatus
);

export default router;

