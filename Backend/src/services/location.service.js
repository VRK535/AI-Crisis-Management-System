
import ApiError from "../utils/ApiError.js";
import mapProvider from "../integrations/maps/map.provider.js";

class LocationService {
  // Validate latitude and longitude
  validateLocation(latitude, longitude) {
    return mapProvider.validateCoordinates(
      latitude,
      longitude
    );
  }

  // Convert coordinates into a readable address
  async getAddressFromCoordinates(latitude, longitude) {
    this.validateLocation(latitude, longitude);

    return mapProvider.reverseGeocode(
      latitude,
      longitude
    );
  }

  // Validate a location received from the client
  async processLocation(locationData) {
    const { latitude, longitude } = locationData ?? {};

    if (latitude === undefined || longitude === undefined) {
      throw new ApiError(
        400,
        "Latitude and longitude are required"
      );
    }

    const coordinates = this.validateLocation(
      latitude,
      longitude
    );

    return {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    };
  }
}

export default new LocationService();