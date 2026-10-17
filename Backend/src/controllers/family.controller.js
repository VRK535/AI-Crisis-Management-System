
import familyService from "../services/family.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// Add a family member
export const addFamilyMember = asyncHandler(async (req, res) => {
  const member = await familyService.addFamilyMember(
    req.user.id,
    req.body
  );

  res.status(201).json(
    new ApiResponse(201, member, "Family member added successfully")
  );
});

// Get all family members
export const getFamilyMembers = asyncHandler(async (req, res) => {
  const members = await familyService.getFamilyMembers(req.user.id);

  res.status(200).json(
    new ApiResponse(200, members, "Family members fetched successfully")
  );
});

// Get a single family member
export const getFamilyMember = asyncHandler(async (req, res) => {
  const member = await familyService.getFamilyMember(
    req.user.id,
    req.params.memberId
  );

  res.status(200).json(
    new ApiResponse(200, member, "Family member fetched successfully")
  );
});

// Update a family member
export const updateFamilyMember = asyncHandler(async (req, res) => {
  const member = await familyService.updateFamilyMember(
    req.user.id,
    req.params.memberId,
    req.body
  );

  res.status(200).json(
    new ApiResponse(200, member, "Family member updated successfully")
  );
});

// Delete a family member
export const deleteFamilyMember = asyncHandler(async (req, res) => {
  await familyService.deleteFamilyMember(
    req.user.id,
    req.params.memberId
  );

  res.status(200).json(
    new ApiResponse(200, null, "Family member deleted successfully")
  );
});