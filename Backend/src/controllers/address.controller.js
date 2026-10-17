
import addressService from "../services/address.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// Add address
export const addAddress = asyncHandler(async (req, res) => {
  const address = await addressService.addAddress(
    req.user.id,
    req.body
  );

  res.status(201).json(
    new ApiResponse(201, address, "Address added successfully")
  );
});

// Get all addresses
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user.id);

  res.status(200).json(
    new ApiResponse(200, addresses, "Addresses fetched successfully")
  );
});

// Get a single address
export const getAddress = asyncHandler(async (req, res) => {
  const address = await addressService.getAddress(
    req.user.id,
    req.params.addressId
  );

  res.status(200).json(
    new ApiResponse(200, address, "Address fetched successfully")
  );
});

// Update address
export const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(
    req.user.id,
    req.params.addressId,
    req.body
  );

  res.status(200).json(
    new ApiResponse(200, address, "Address updated successfully")
  );
});

// Delete address
export const deleteAddress = asyncHandler(async (req, res) => {
  await addressService.deleteAddress(
    req.user.id,
    req.params.addressId
  );

  res.status(200).json(
    new ApiResponse(200, null, "Address deleted successfully")
  );
});