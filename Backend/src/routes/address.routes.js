
import { Router } from "express";

import {
  addAddress,
  getAddresses,
  getAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../validators/address.validator.js";

const router = Router();

// All address routes require authentication
router.use(authenticate);

// POST /api/v1/addresses
router.post(
  "/",
  validate(createAddressSchema),
  addAddress
);

// GET /api/v1/addresses
router.get("/", getAddresses);

// GET /api/v1/addresses/:addressId
router.get("/:addressId", getAddress);

// PATCH /api/v1/addresses/:addressId
router.patch(
  "/:addressId",
  validate(updateAddressSchema),
  updateAddress
);

// DELETE /api/v1/addresses/:addressId
router.delete("/:addressId", deleteAddress);

export default router;