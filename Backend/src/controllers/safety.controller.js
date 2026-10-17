
import safetyService from "../services/safety.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// Create a safety advisory
export const createAdvisory = asyncHandler(async (req, res) => {
  const advisory = await safetyService.createAdvisory(req.body);

  res.status(201).json(
    new ApiResponse(201, advisory, "Safety advisory created successfully")
  );
});

// Get all active advisories
export const getAdvisories = asyncHandler(async (req, res) => {
  const advisories = await safetyService.getAdvisories();

  res.status(200).json(
    new ApiResponse(200, advisories, "Safety advisories fetched successfully")
  );
});

// Get advisories for a crisis type
export const getAdvisoriesByCrisis = asyncHandler(async (req, res) => {
  const advisories = await safetyService.getAdvisoriesByCrisis(
    req.params.crisisId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      advisories,
      "Safety advisories fetched successfully"
    )
  );
});

// Get a single advisory
export const getAdvisoryById = asyncHandler(async (req, res) => {
  const advisory = await safetyService.getAdvisoryById(
    req.params.advisoryId
  );

  res.status(200).json(
    new ApiResponse(200, advisory, "Safety advisory fetched successfully")
  );
});

// Update an advisory
export const updateAdvisory = asyncHandler(async (req, res) => {
  const advisory = await safetyService.updateAdvisory(
    req.params.advisoryId,
    req.body
  );

  res.status(200).json(
    new ApiResponse(200, advisory, "Safety advisory updated successfully")
  );
});

// Deactivate an advisory
export const deactivateAdvisory = asyncHandler(async (req, res) => {
  const advisory = await safetyService.deactivateAdvisory(
    req.params.advisoryId
  );

  res.status(200).json(
    new ApiResponse(200, advisory, "Safety advisory deactivated successfully")
  );
});