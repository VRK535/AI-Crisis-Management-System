import CrisisType from "../models/CrisisType.js";
import ApiError from "../utils/ApiError.js";

class CrisisService {
  // Create a new crisis type (admin operation)
  async createCrisis(crisisData) {
    const existingCrisis = await CrisisType.findOne({
      name: crisisData.name,
    });

    if (existingCrisis) {
      throw new ApiError(409, "Crisis type already exists");
    }

    return CrisisType.create(crisisData);
  }

  // Alias
  async createCrisisType(crisisData) {
    return this.createCrisis(crisisData);
  }

  // Get all active crisis types
  async getCrises() {
    return CrisisType.find({
      isActive: true,
    }).sort({ name: 1 });
  }

  // Alias
  async getAllCrisisTypes() {
    return this.getCrises();
  }

  // Get a crisis type by ID
  async getCrisisById(crisisId) {
    const crisis = await CrisisType.findOne({
      _id: crisisId,
      isActive: true,
    });

    if (!crisis) {
      throw new ApiError(404, "Crisis type not found");
    }

    return crisis;
  }

  // Alias
  async getCrisisTypeById(crisisId) {
    return this.getCrisisById(crisisId);
  }

  // Update a crisis type (admin operation)
  async updateCrisis(crisisId, updateData) {
    const crisis = await CrisisType.findByIdAndUpdate(
      crisisId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!crisis) {
      throw new ApiError(404, "Crisis type not found");
    }

    return crisis;
  }

  // Alias
  async updateCrisisType(crisisId, updateData) {
    return this.updateCrisis(crisisId, updateData);
  }

  // Deactivate a crisis type instead of permanently deleting it
  async deactivateCrisis(crisisId) {
    const crisis = await CrisisType.findByIdAndUpdate(
      crisisId,
      { $set: { isActive: false } },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!crisis) {
      throw new ApiError(404, "Crisis type not found");
    }

    return crisis;
  }

  // Alias
  async deactivateCrisisType(crisisId) {
    return this.deactivateCrisis(crisisId);
  }
}

export default new CrisisService();