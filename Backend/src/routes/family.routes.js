
import { Router } from "express";

import {
  addFamilyMember,
  getFamilyMembers,
  getFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
} from "../controllers/family.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  createFamilyMemberSchema,
  updateFamilyMemberSchema,
} from "../validators/family.validator.js";

const router = Router();

// All family routes require authentication
router.use(authenticate);

// POST /api/v1/family
router.post(
  "/",
  validate(createFamilyMemberSchema),
  addFamilyMember
);

// GET /api/v1/family
router.get("/", getFamilyMembers);

// GET /api/v1/family/:memberId
router.get("/:memberId", getFamilyMember);

// PATCH /api/v1/family/:memberId
router.patch(
  "/:memberId",
  validate(updateFamilyMemberSchema),
  updateFamilyMember
);

// DELETE /api/v1/family/:memberId
router.delete("/:memberId", deleteFamilyMember);

export default router;