import FamilyMember from "../models/FamilyMember.js";
import ApiError from "../utils/ApiError.js";

class FamilyService {
  // Add a family member
  async addFamilyMember(userId, memberData) {
    const member = await FamilyMember.create({
      ...memberData,
      userId: userId,
    });

    return member;
  }

  // Get all family members of logged-in user
  async getFamilyMembers(userId) {
    return await FamilyMember.find({
      userId: userId,
    }).sort({ createdAt: -1 });
  }

  // Get one family member
  async getFamilyMember(userId, memberId) {
    const member = await FamilyMember.findOne({
      _id: memberId,
      userId: userId,
    });

    if (!member) {
      throw new ApiError(404, "Family member not found");
    }

    return member;
  }

  // Alias for backward compatibility
  async getFamilyMemberById(userId, memberId) {
    return this.getFamilyMember(userId, memberId);
  }

  // Update a family member
  async updateFamilyMember(userId, memberId, updateData) {
    const member = await FamilyMember.findOneAndUpdate(
      {
        _id: memberId,
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

    if (!member) {
      throw new ApiError(404, "Family member not found");
    }

    return member;
  }

  // Delete a family member
  async deleteFamilyMember(userId, memberId) {
    const member = await FamilyMember.findOneAndDelete({
      _id: memberId,
      userId: userId,
    });

    if (!member) {
      throw new ApiError(404, "Family member not found");
    }

    return {
      message: "Family member deleted successfully",
    };
  }
}

export default new FamilyService();