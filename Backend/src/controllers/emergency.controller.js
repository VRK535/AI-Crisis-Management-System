
import emergencyService from "../services/emergency.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// Add emergency contact
export const addEmergencyContact = asyncHandler(async (req, res) => {
  const contact = await emergencyService.addEmergencyContact(
    req.user.id,
    req.body
  );

  res.status(201).json(
    new ApiResponse(201, contact, "Emergency contact added successfully")
  );
});

// Get all emergency contacts
export const getEmergencyContacts = asyncHandler(async (req, res) => {
  const contacts = await emergencyService.getEmergencyContacts(req.user.id);

  res.status(200).json(
    new ApiResponse(200, contacts, "Emergency contacts fetched successfully")
  );
});

// Get a single emergency contact
export const getEmergencyContact = asyncHandler(async (req, res) => {
  const contact = await emergencyService.getEmergencyContact(
    req.user.id,
    req.params.contactId
  );

  res.status(200).json(
    new ApiResponse(200, contact, "Emergency contact fetched successfully")
  );
});

// Update emergency contact
export const updateEmergencyContact = asyncHandler(async (req, res) => {
  const contact = await emergencyService.updateEmergencyContact(
    req.user.id,
    req.params.contactId,
    req.body
  );

  res.status(200).json(
    new ApiResponse(200, contact, "Emergency contact updated successfully")
  );
});

// Delete emergency contact
export const deleteEmergencyContact = asyncHandler(async (req, res) => {
  await emergencyService.deleteEmergencyContact(
    req.user.id,
    req.params.contactId
  );

  res.status(200).json(
    new ApiResponse(200, null, "Emergency contact deleted successfully")
  );
});