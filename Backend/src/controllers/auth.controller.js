
import authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// Register user
export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      user,
      "User registered successfully"
    )
  );
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Login successful"
    )
  );
});