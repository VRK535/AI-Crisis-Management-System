import incidentService from "../services/incident.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// POST /api/v1/incidents
export const createIncident = asyncHandler(async (req, res) => {
  const incident = await incidentService.createIncident(req.user.id, req.body);

  res.status(201).json(
    new ApiResponse(201, incident, "Incident reported successfully")
  );
});

// GET /api/v1/incidents
export const getIncidents = asyncHandler(async (req, res) => {
  const incidents = await incidentService.getIncidents(req.query);

  res.status(200).json(
    new ApiResponse(200, incidents, "Incidents retrieved successfully")
  );
});

// GET /api/v1/incidents/:incidentId
export const getIncidentById = asyncHandler(async (req, res) => {
  const incident = await incidentService.getIncidentById(req.params.incidentId);

  res.status(200).json(
    new ApiResponse(200, incident, "Incident details retrieved successfully")
  );
});

// PATCH /api/v1/incidents/:incidentId/status
export const updateIncidentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const incident = await incidentService.updateIncidentStatus(
    req.params.incidentId,
    status,
    req.user.id
  );

  res.status(200).json(
    new ApiResponse(200, incident, "Incident status updated successfully")
  );
});

// GET /api/v1/incidents/dashboard/operational
export const getOperationalDashboard = asyncHandler(async (req, res) => {
  const dashboard = await incidentService.getOperationalDashboard();

  res.status(200).json(
    new ApiResponse(200, dashboard, "Operational dashboard fetched successfully")
  );
});

