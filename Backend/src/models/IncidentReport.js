import mongoose from "mongoose";
import { INCIDENT_STATUS, CRISIS_SEVERITY } from "../utils/constants.js";

const incidentReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    crisisTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrisisType",
      default: null,
      index: true
    },

    title: {
      type: String,
      required: [true, "Report title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true
    },

    severity: {
      type: String,
      enum: Object.values(CRISIS_SEVERITY),
      default: CRISIS_SEVERITY.MEDIUM
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (coordinates) {
            return (
              Array.isArray(coordinates) &&
              coordinates.length === 2 &&
              coordinates[0] >= -180 &&
              coordinates[0] <= 180 &&
              coordinates[1] >= -90 &&
              coordinates[1] <= 90
            );
          },
          message: "Coordinates must be [longitude, latitude]"
        }
      }
    },

    addressText: {
      type: String,
      trim: true,
      default: ""
    },

    reportedNeeds: {
      type: [String], // e.g. ["Medical assistance", "Drinking water", "Evacuation boat", "Food"]
      default: []
    },

    affectedPeopleCount: {
      type: Number,
      default: 1,
      min: 0
    },

    status: {
      type: String,
      enum: Object.values(INCIDENT_STATUS),
      default: INCIDENT_STATUS.REPORTED,
      index: true
    },

    mediaUrls: {
      type: [String],
      default: []
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

incidentReportSchema.index({ location: "2dsphere" });

const IncidentReport = mongoose.model("IncidentReport", incidentReportSchema);

export default IncidentReport;

