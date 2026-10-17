import sosService from "../services/sos.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// Trigger SOS
export const createSOS = asyncHandler(async (req, res) => {
  const sos = await sosService.createSOS(req.user.id, req.body);

  res.status(201).json(
    new ApiResponse(201, sos, "SOS triggered successfully")
  );
});

// Get logged-in user's SOS history
export const getSOSHistory = asyncHandler(async (req, res) => {
  const history = await sosService.getSOSHistory(req.user.id);

  res.status(200).json(
    new ApiResponse(200, history, "SOS history fetched successfully")
  );
});

// Get active prioritized rescue triage queue (admin / responders)
export const getActiveTriageQueue = asyncHandler(async (req, res) => {
  const queue = await sosService.getActiveTriageQueue();

  res.status(200).json(
    new ApiResponse(200, queue, "Rescue triage queue retrieved successfully")
  );
});

// Get a specific SOS request
export const getSOSById = asyncHandler(async (req, res) => {
  const sos = await sosService.getSOSById(
    req.user.id,
    req.params.sosId
  );

  res.status(200).json(
    new ApiResponse(200, sos, "SOS details fetched successfully")
  );
});

// Cancel a pending SOS
export const cancelSOS = asyncHandler(async (req, res) => {
  const sos = await sosService.cancelSOS(
    req.user.id,
    req.params.sosId
  );

  res.status(200).json(
    new ApiResponse(200, sos, "SOS cancelled successfully")
  );
});

// Resolve SOS (authorized responder/admin only)
export const resolveSOS = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const sos = await sosService.resolveSOS(
    req.params.sosId,
    req.user.id,
    notes
  );

  res.status(200).json(
    new ApiResponse(200, sos, "SOS resolved successfully")
  );
});