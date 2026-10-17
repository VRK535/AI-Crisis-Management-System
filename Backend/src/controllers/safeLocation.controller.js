import safeLocationService from "../services/safeLocation.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// GET /api/v1/safe-locations/nearby
export const getNearbySafeLocations = asyncHandler(async (req, res) => {
  const {
    longitude,
    latitude,
    crisisTypeId,
    shelterType,
    maxDistance,
    wheelchairAccessible,
  } = req.query;

  const locations = await safeLocationService.getNearbySafeLocations({
    longitude,
    latitude,
    crisisTypeId,
    shelterType,
    maxDistance,
    wheelchairAccessible,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      locations,
      "Nearby safe locations retrieved successfully"
    )
  );
});

// GET /api/v1/safe-locations/offline-cache
export const getOfflineSafeZones = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const result = await safeLocationService.getOfflineSafeZones(city);

  res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Offline safe zones downloaded successfully"
    )
  );
});

// GET /api/v1/safe-locations
export const getSafeLocations = asyncHandler(async (req, res) => {
  const locations = await safeLocationService.getSafeLocations(req.query);

  res.status(200).json(
    new ApiResponse(200, locations, "Safe locations fetched successfully")
  );
});

// GET /api/v1/safe-locations/:locationId
export const getSafeLocationById = asyncHandler(async (req, res) => {
  const location = await safeLocationService.getSafeLocationById(
    req.params.locationId
  );

  res.status(200).json(
    new ApiResponse(200, location, "Safe location fetched successfully")
  );
});

// POST /api/v1/safe-locations
export const createSafeLocation = asyncHandler(async (req, res) => {
  const location = await safeLocationService.createSafeLocation(req.body);

  res.status(201).json(
    new ApiResponse(201, location, "Safe location created successfully")
  );
});

// PATCH /api/v1/safe-locations/:locationId
export const updateSafeLocation = asyncHandler(async (req, res) => {
  const location = await safeLocationService.updateSafeLocation(
    req.params.locationId,
    req.body
  );

  res.status(200).json(
    new ApiResponse(200, location, "Safe location updated successfully")
  );
});

// PATCH /api/v1/safe-locations/:locationId/occupancy
export const updateOccupancy = asyncHandler(async (req, res) => {
  const { currentOccupancy } = req.body;
  const location = await safeLocationService.updateOccupancy(
    req.params.locationId,
    currentOccupancy
  );

  res.status(200).json(
    new ApiResponse(200, location, "Shelter occupancy updated successfully")
  );
});

// DELETE /api/v1/safe-locations/:locationId
export const deleteSafeLocation = asyncHandler(async (req, res) => {
  await safeLocationService.deleteSafeLocation(req.params.locationId);

  res.status(200).json(
    new ApiResponse(200, null, "Safe location deactivated successfully")
  );
});

