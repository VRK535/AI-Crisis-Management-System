import mongoose from "mongoose";
import { SOS_STATUS } from "../utils/constants.js";

const sosSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true
    },

    crisisTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrisisType",
      default: null,
      index: true
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point"
      },

      coordinates: {
        type: [Number],
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

    message: {
      type: String,
      trim: true,
      maxlength: [500, "SOS message cannot exceed 500 characters"],
      default: ""
    },

    status: {
      type: String,
      enum: Object.values(SOS_STATUS),
      default: SOS_STATUS.PENDING,
      index: true
    },

    priorityScore: {
      type: Number,
      default: 5, // 1 (lowest) to 10 (highest/critical)
      min: 1,
      max: 10
    },

    medicalEmergency: {
      type: Boolean,
      default: false
    },

    peopleCount: {
      type: Number,
      default: 1,
      min: 1
    },

    assignedResponderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    responderNotes: {
      type: String,
      default: ""
    },

    respondedAt: {
      type: Date,
      default: null
    },

    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

sosSchema.index({ location: "2dsphere" });

const SOS = mongoose.model("SOS", sosSchema);

export default SOS;