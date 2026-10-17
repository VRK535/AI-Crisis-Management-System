import mongoose from "mongoose";
import SafeLocation from "../models/SafeLocation.js";
import ApiError from "../utils/ApiError.js";
import { LOCATION_STATUS } from "../utils/constants.js";

class SafeLocationService {
  // Recommend nearby safe locations dynamically based on user GPS & crisis type
  async getNearbySafeLocations({
    longitude,
    latitude,
    crisisTypeId = null,
    shelterType = null,
    maxDistance = 30000, // in meters (default 30km)
    wheelchairAccessible = false,
  }) {
    const lng = Number(longitude);
    const lat = Number(latitude);

    if (isNaN(lng) || isNaN(lat)) {
      throw new ApiError(400, "Valid longitude and latitude are required");
    }

    const matchQuery = {
      isActive: true,
      status: { $in: [LOCATION_STATUS.OPEN, LOCATION_STATUS.RESTRICTED] },
    };

    if (shelterType) {
      matchQuery.type = shelterType;
    }

    if (crisisTypeId) {
      matchQuery.$or = [
        { supportedCrisisTypes: new mongoose.Types.ObjectId(crisisTypeId) },
        { supportedCrisisTypes: { $size: 0 } },
      ];
    }

    if (wheelchairAccessible === true || wheelchairAccessible === "true") {
      matchQuery["facilities.wheelchairAccessible"] = true;
    }

    const locations = await SafeLocation.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          distanceField: "distanceMeters",
          maxDistance: Number(maxDistance),
          spherical: true,
          query: matchQuery,
        },
      },
      {
        $addFields: {
          availableSlots: {
            $max: [0, { $subtract: ["$capacity", "$currentOccupancy"] }],
          },
          distanceKm: {
            $round: [{ $divide: ["$distanceMeters", 1000] }, 2],
          },
          occupancyPercentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$currentOccupancy", { $max: [1, "$capacity"] }] },
                  100,
                ],
              },
              1,
            ],
          },
        },
      },
      {
        // Sort primarily by status (open first), then by distance
        $sort: {
          status: 1,
          distanceMeters: 1,
        },
      },
      {
        $limit: 20,
      },
    ]);

    return locations.map((loc) => ({
      ...loc,
      recommendationLevel:
        loc.availableSlots > 20 && loc.riskLevel === "low"
          ? "HIGHLY_RECOMMENDED"
          : loc.availableSlots > 0
          ? "RECOMMENDED"
          : "NEAR_CAPACITY",
    }));
  }

  // Get cached safe zones for offline mobile map caching
  async getOfflineSafeZones(city = "") {
    const query = { isActive: true, status: LOCATION_STATUS.OPEN };
    if (city) {
      query["address.city"] = new RegExp(city, "i");
    }

    const safeZones = await SafeLocation.find(query).select(
      "name type location address elevationMeters capacity currentOccupancy riskLevel facilities contactPhone evacuationNotes"
    );

    return {
      total: safeZones.length,
      cachedAt: new Date().toISOString(),
      safeZones,
    };
  }

  // Admin: Get all safe locations with filters
  async getSafeLocations(filter = {}) {
    return SafeLocation.find(filter)
      .populate("supportedCrisisTypes", "name severity")
      .sort({ createdAt: -1 });
  }

  // Get safe location by ID
  async getSafeLocationById(locationId) {
    const location = await SafeLocation.findById(locationId).populate(
      "supportedCrisisTypes",
      "name severity"
    );

    if (!location) {
      throw new ApiError(404, "Safe location not found");
    }

    return location;
  }

  // Create safe location (Admin)
  async createSafeLocation(data) {
    return SafeLocation.create(data);
  }

  // Update safe location (Admin)
  async updateSafeLocation(locationId, updateData) {
    const location = await SafeLocation.findByIdAndUpdate(
      locationId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!location) {
      throw new ApiError(404, "Safe location not found");
    }

    return location;
  }

  // Update live occupancy (Emergency Responders / Shelter Managers)
  async updateOccupancy(locationId, currentOccupancy) {
    const location = await SafeLocation.findById(locationId);

    if (!location) {
      throw new ApiError(404, "Safe location not found");
    }

    location.currentOccupancy = currentOccupancy;
    if (location.currentOccupancy >= location.capacity) {
      location.status = LOCATION_STATUS.FULL;
    } else if (location.status === LOCATION_STATUS.FULL) {
      location.status = LOCATION_STATUS.OPEN;
    }

    await location.save();
    return location;
  }

  // Delete / deactivate safe location
  async deleteSafeLocation(locationId) {
    const location = await SafeLocation.findByIdAndUpdate(
      locationId,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!location) {
      throw new ApiError(404, "Safe location not found");
    }

    return { message: "Safe location deactivated successfully" };
  }
}

export default new SafeLocationService();

