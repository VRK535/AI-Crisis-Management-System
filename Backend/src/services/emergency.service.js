import EmergencyContact from "../models/EmergencyContact.js";
import ApiError from "../utils/ApiError.js";

class EmergencyService {
  // Add an emergency contact
  async addEmergencyContact(userId, contactData) {
    return EmergencyContact.create({
      ...contactData,
      userId: userId,
    });
  }

  // Alias
  async createContact(userId, contactData) {
    return this.addEmergencyContact(userId, contactData);
  }

  // Get all contacts of the logged-in user (plus system default emergency numbers)
  async getEmergencyContacts(userId) {
    return EmergencyContact.find({
      $or: [{ userId: userId }, { userId: null }]
    }).sort({ createdAt: -1 });
  }

  // Alias
  async getContacts(userId) {
    return this.getEmergencyContacts(userId);
  }

  // Get one emergency contact
  async getEmergencyContact(userId, contactId) {
    const contact = await EmergencyContact.findOne({
      _id: contactId,
      $or: [{ userId: userId }, { userId: null }]
    });

    if (!contact) {
      throw new ApiError(404, "Emergency contact not found");
    }

    return contact;
  }

  // Alias
  async getContactById(userId, contactId) {
    return this.getEmergencyContact(userId, contactId);
  }

  // Update an emergency contact
  async updateEmergencyContact(userId, contactId, updateData) {
    const contact = await EmergencyContact.findOneAndUpdate(
      {
        _id: contactId,
        userId: userId,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!contact) {
      throw new ApiError(404, "Emergency contact not found");
    }

    return contact;
  }

  // Alias
  async updateContact(userId, contactId, updateData) {
    return this.updateEmergencyContact(userId, contactId, updateData);
  }

  // Delete an emergency contact
  async deleteEmergencyContact(userId, contactId) {
    const contact = await EmergencyContact.findOneAndDelete({
      _id: contactId,
      userId: userId,
    });

    if (!contact) {
      throw new ApiError(404, "Emergency contact not found");
    }

    return {
      message: "Emergency contact deleted successfully",
    };
  }

  // Alias
  async deleteContact(userId, contactId) {
    return this.deleteEmergencyContact(userId, contactId);
  }
}

export default new EmergencyService();