import SafetyAdvisory from "../models/SafetyAdvisory.js";
import ApiError from "../utils/ApiError.js";

class SafetyService {
  // Create a safety advisory (admin operation)
  async createAdvisory(advisoryData) {
    return SafetyAdvisory.create(advisoryData);
  }

  // Get all active safety advisories
  async getAdvisories() {
    return SafetyAdvisory.find({
      isActive: true,
    })
      .populate("crisisTypeId", "name severity")
      .sort({ priority: -1, createdAt: -1 });
  }

  // Alias
  async getAllAdvisories() {
    return this.getAdvisories();
  }

  // Get advisories for a specific crisis type
  async getAdvisoriesByCrisis(crisisTypeId) {
    return SafetyAdvisory.find({
      crisisTypeId: crisisTypeId,
      isActive: true,
    })
      .populate("crisisTypeId", "name severity")
      .sort({ priority: -1, createdAt: -1 });
  }

  // Get a specific advisory
  async getAdvisoryById(advisoryId) {
    const advisory = await SafetyAdvisory.findOne({
      _id: advisoryId,
      isActive: true,
    }).populate("crisisTypeId", "name severity");

    if (!advisory) {
      throw new ApiError(404, "Safety advisory not found");
    }

    return advisory;
  }

  // Update an advisory (admin operation)
  async updateAdvisory(advisoryId, updateData) {
    const advisory = await SafetyAdvisory.findByIdAndUpdate(
      advisoryId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!advisory) {
      throw new ApiError(404, "Safety advisory not found");
    }

    return advisory;
  }

  // Deactivate an advisory instead of permanently deleting it
  async deactivateAdvisory(advisoryId) {
    const advisory = await SafetyAdvisory.findByIdAndUpdate(
      advisoryId,
      { $set: { isActive: false } },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!advisory) {
      throw new ApiError(404, "Safety advisory not found");
    }

    return advisory;
  }
}

export default new SafetyService();