import { Router } from "express";
import {
  addEmergencyContact,
  getEmergencyContacts,
  getEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from "../controllers/emergency.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  createEmergencyContactSchema,
  updateEmergencyContactSchema,
} from "../validators/emergency.validator.js";

const router = Router();

// All emergency contact routes require authentication
router.use(authenticate);

// POST /api/v1/emergency-contacts
router.post(
  "/",
  validate(createEmergencyContactSchema),
  addEmergencyContact
);

// GET /api/v1/emergency-contacts
router.get("/", getEmergencyContacts);

// GET /api/v1/emergency-contacts/:contactId
router.get("/:contactId", getEmergencyContact);

// PATCH /api/v1/emergency-contacts/:contactId
router.patch(
  "/:contactId",
  validate(updateEmergencyContactSchema),
  updateEmergencyContact
);

// DELETE /api/v1/emergency-contacts/:contactId
router.delete("/:contactId", deleteEmergencyContact);

export default router;

