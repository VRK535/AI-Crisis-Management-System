import SOS from "../models/SOS.js";
import User from "../models/User.js";
import FamilyMember from "../models/FamilyMember.js";
import CrisisType from "../models/CrisisType.js";
import ApiError from "../utils/ApiError.js";
import { SOS_STATUS } from "../utils/constants.js";

class SOSService {
  // Calculate AI-driven rescue triage priority (1 to 10)
  async calculateTriageScore(userId, crisisTypeId, initialScore = 5) {
    let score = initialScore;

    try {
      const [user, familyMembers, crisis] = await Promise.all([
        User.findById(userId),
        FamilyMember.find({ userId }),
        crisisTypeId ? CrisisType.findById(crisisTypeId) : null
      ]);

      if (user) {
        if (user.medicalConditions && user.medicalConditions.length > 0) {
          score += 2;
        }
        if (user.specialNeeds) {
          score += 1.5;
        }
        if (user.age && (user.age >= 60 || user.age <= 5)) {
          score += 2;
        }
      }

      if (familyMembers && familyMembers.length > 0) {
        const vulnerableFamily = familyMembers.some(
          (m) => m.age >= 65 || m.age <= 5
        );
        if (vulnerableFamily) score += 1.5;
      }

      if (crisis) {
        if (crisis.severity === "critical") score += 2;
        else if (crisis.severity === "high") score += 1;
      }
    } catch {
      // Fallback to default score if user data lookup fails
    }

    return Math.min(10, Math.max(1, Math.round(score)));
  }

  // Create an SOS request
  async createSOS(userId, sosData) {
    const priorityScore = await this.calculateTriageScore(
      userId,
      sosData.crisisTypeId,
      sosData.priorityScore || 5
    );

    const sos = await SOS.create({
      ...sosData,
      userId: userId,
      priorityScore,
      status: SOS_STATUS.PENDING,
    });

    return await sos.populate([
      { path: "userId", select: "name phone email age medicalConditions" },
      { path: "crisisTypeId", select: "name severity" }
    ]);
  }

  // Get SOS history for the logged-in user
  async getSOSHistory(userId) {
    return SOS.find({
      userId: userId,
    })
      .populate("crisisTypeId", "name severity")
      .sort({ createdAt: -1 });
  }

  // Alias
  async getUserSOSHistory(userId) {
    return this.getSOSHistory(userId);
  }

  // Get a specific SOS belonging to the user
  async getSOSById(userId, sosId) {
    const sos = await SOS.findOne({
      _id: sosId,
      userId: userId,
    }).populate([
      { path: "userId", select: "name phone email age medicalConditions" },
      { path: "crisisTypeId", select: "name severity" }
    ]);

    if (!sos) {
      throw new ApiError(404, "SOS request not found");
    }

    return sos;
  }

  // Cancel a pending SOS request
  async cancelSOS(userId, sosId) {
    const sos = await SOS.findOneAndUpdate(
      {
        _id: sosId,
        userId: userId,
        status: { $in: [SOS_STATUS.PENDING, SOS_STATUS.ACTIVE] },
      },
      {
        $set: {
          status: SOS_STATUS.CANCELLED,
          resolvedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!sos) {
      throw new ApiError(
        409,
        "SOS not found or cannot be cancelled in its current state"
      );
    }

    return sos;
  }

  // Resolve an SOS request (authorized responder/admin only)
  async resolveSOS(sosId, responderId = null, notes = "") {
    const update = {
      status: SOS_STATUS.RESOLVED,
      resolvedAt: new Date()
    };
    if (responderId) update.assignedResponderId = responderId;
    if (notes) update.responderNotes = notes;

    const sos = await SOS.findOneAndUpdate(
      {
        _id: sosId,
        status: {
          $in: [
            SOS_STATUS.PENDING,
            SOS_STATUS.ACTIVE,
            SOS_STATUS.ACKNOWLEDGED,
          ],
        },
      },
      { $set: update },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!sos) {
      throw new ApiError(
        409,
        "SOS not found or already closed"
      );
    }

    return sos;
  }

  // Triage queue for dashboard / responders
  async getActiveTriageQueue() {
    return SOS.find({
      status: { $in: [SOS_STATUS.PENDING, SOS_STATUS.ACTIVE, SOS_STATUS.ACKNOWLEDGED] }
    })
      .populate("userId", "name phone age medicalConditions bloodGroup")
      .populate("crisisTypeId", "name severity")
      .sort({ priorityScore: -1, createdAt: 1 });
  }
}

export default new SOSService();