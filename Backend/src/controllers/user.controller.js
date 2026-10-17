
import userService from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// Get logged-in user's profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);

  res.status(200).json(
    new ApiResponse(
      200,
      user,
      "Profile fetched successfully"
    )
  );
});

// Update logged-in user's profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(
    req.user.id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(
      200,
      user,
      "Profile updated successfully"
    )
  );
});