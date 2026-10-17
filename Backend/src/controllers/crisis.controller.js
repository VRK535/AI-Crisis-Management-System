
import crisisService from "../services/crisis.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// Create a crisis type
export const createCrisis = asyncHandler(async (req, res) => {
  const crisis = await crisisService.createCrisis(req.body);

  res.status(201).json(
    new ApiResponse(201, crisis, "Crisis type created successfully")
  );
});

// Get all active crisis types
export const getCrises = asyncHandler(async (req, res) => {
  const crises = await crisisService.getCrises();

  res.status(200).json(
    new ApiResponse(200, crises, "Crisis types fetched successfully")
  );
});

// Get a crisis type by ID
export const getCrisisById = asyncHandler(async (req, res) => {
  const crisis = await crisisService.getCrisisById(req.params.crisisId);

  res.status(200).json(
    new ApiResponse(200, crisis, "Crisis type fetched successfully")
  );
});

// Update a crisis type
export const updateCrisis = asyncHandler(async (req, res) => {
  const crisis = await crisisService.updateCrisis(
    req.params.crisisId,
    req.body
  );

  res.status(200).json(
    new ApiResponse(200, crisis, "Crisis type updated successfully")
  );
});

// Deactivate a crisis type
export const deactivateCrisis = asyncHandler(async (req, res) => {
  const crisis = await crisisService.deactivateCrisis(
    req.params.crisisId
  );

  res.status(200).json(
    new ApiResponse(200, crisis, "Crisis type deactivated successfully")
  );
});