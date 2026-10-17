import { Router } from "express";

import {
  createSOS,
  getSOSHistory,
  getSOSById,
  cancelSOS,
  resolveSOS,
  getActiveTriageQueue,
} from "../controllers/sos.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createSOSSchema } from "../validators/sos.validator.js";

const router = Router();

// All SOS routes require authentication
router.use(authenticate);

// Prioritized rescue queue (for authorities & responders)
router.get(
  "/triage/queue",
  authorizeRoles("admin", "responder"),
  getActiveTriageQueue
);

// Trigger SOS
router.post(
  "/",
  validate(createSOSSchema),
  createSOS
);

// Get user SOS history
router.get("/", getSOSHistory);

// Get specific SOS
router.get("/:sosId", getSOSById);

// Cancel pending SOS
router.patch("/:sosId/cancel", cancelSOS);

// Resolve SOS (admin / responder only)
router.patch(
  "/:sosId/resolve",
  authorizeRoles("admin", "responder"),
  resolveSOS
);

export default router;