import IncidentReport from "../models/IncidentReport.js";
import SOS from "../models/SOS.js";
import SafeLocation from "../models/SafeLocation.js";
import CrisisType from "../models/CrisisType.js";
import ApiError from "../utils/ApiError.js";
import { INCIDENT_STATUS, SOS_STATUS } from "../utils/constants.js";

class IncidentService {
  // Citizen or IoT sensor incident submission
  async createIncident(userId, incidentData) {
    const incident = await IncidentReport.create({
      ...incidentData,
      userId: userId,
      status: INCIDENT_STATUS.REPORTED,
    });

    return await incident.populate([
      { path: "userId", select: "name phone email" },
      { path: "crisisTypeId", select: "name severity" },
    ]);
  }

  // List incidents with filters (e.g. status, crisisTypeId, severity)
  async getIncidents(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.severity) filter.severity = query.severity;
    if (query.crisisTypeId) filter.crisisTypeId = query.crisisTypeId;

    return IncidentReport.find(filter)
      .populate("userId", "name phone email")
      .populate("crisisTypeId", "name severity")
      .sort({ createdAt: -1 });
  }

  // Get incident by ID
  async getIncidentById(incidentId) {
    const incident = await IncidentReport.findById(incidentId).populate([
      { path: "userId", select: "name phone email" },
      { path: "crisisTypeId", select: "name severity" },
      { path: "verifiedBy", select: "name role" },
    ]);

    if (!incident) {
      throw new ApiError(404, "Incident report not found");
    }

    return incident;
  }

  // Admin / Responder: update status (verify, respond, resolve)
  async updateIncidentStatus(incidentId, status, verifiedById) {
    const incident = await IncidentReport.findByIdAndUpdate(
      incidentId,
      {
        $set: {
          status,
          verifiedBy: verifiedById,
        },
      },
      { new: true, runValidators: true }
    );

    if (!incident) {
      throw new ApiError(404, "Incident report not found");
    }

    return incident;
  }

  // Decision Support & Unified Operational Dashboard for Authorities
  async getOperationalDashboard() {
    const [
      activeCrises,
      pendingSOSCount,
      activeSOSCount,
      totalIncidents,
      verifiedIncidents,
      shelterStats,
    ] = await Promise.all([
      CrisisType.find({ isActive: true }).select("name severity"),
      SOS.countDocuments({ status: SOS_STATUS.PENDING }),
      SOS.countDocuments({ status: SOS_STATUS.ACTIVE }),
      IncidentReport.countDocuments(),
      IncidentReport.countDocuments({ status: INCIDENT_STATUS.VERIFIED }),
      SafeLocation.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalShelters: { $sum: 1 },
            totalCapacity: { $sum: "$capacity" },
            currentOccupancy: { $sum: "$currentOccupancy" },
          },
        },
      ]),
    ]);

    const shelters = shelterStats[0] || {
      totalShelters: 0,
      totalCapacity: 0,
      currentOccupancy: 0,
    };

    return {
      overview: {
        activeCrisesCount: activeCrises.length,
        pendingSOS: pendingSOSCount,
        activeSOS: activeSOSCount,
        totalIncidents,
        verifiedIncidents,
        shelterCapacityTotal: shelters.totalCapacity,
        shelterOccupantsTotal: shelters.currentOccupancy,
        availableShelterSlots: Math.max(0, shelters.totalCapacity - shelters.currentOccupancy),
        shelterOccupancyRate: shelters.totalCapacity
          ? `${Math.round((shelters.currentOccupancy / shelters.totalCapacity) * 100)}%`
          : "0%",
      },
      activeCrises,
      generatedAt: new Date().toISOString(),
    };
  }
}

export default new IncidentService();

