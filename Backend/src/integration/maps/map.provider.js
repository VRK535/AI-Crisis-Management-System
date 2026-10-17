
import ApiError from "../../utils/ApiError.js";

const validateCoordinates = (latitude, longitude) => {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new ApiError(400, "Invalid coordinates");
  }

  return {
    latitude,
    longitude,
  };
};

const mapProvider = {
  validateCoordinates,

  async reverseGeocode(latitude, longitude) {
    validateCoordinates(latitude, longitude);

    const apiKey = process.env.MAP_API_KEY;

    if (!apiKey) {
      throw new ApiError(
        503,
        "Map service is not configured"
      );
    }

    // Actual geocoding API integration will be added
    // after choosing the map provider.

    throw new ApiError(
      501,
      "Reverse geocoding is not implemented yet"
    );
  },
};

export default mapProvider;