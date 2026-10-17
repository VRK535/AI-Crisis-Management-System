import mongoose from "mongoose";
import { SHELTER_TYPES, LOCATION_STATUS, RISK_LEVEL } from "../utils/constants.js";

const safeLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Safe location name is required"],
      trim: true,
      maxlength: [150, "Name cannot exceed 150 characters"]
    },

    type: {
      type: String,
      enum: Object.values(SHELTER_TYPES),
      required: [true, "Shelter type is required"]
    },

    supportedCrisisTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CrisisType"
      }
    ],

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

    address: {
      street: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, default: "" }
    },

    elevationMeters: {
      type: Number,
      default: 0 // Crucial for flood shelters
    },

    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"]
    },

    currentOccupancy: {
      type: Number,
      default: 0,
      min: [0, "Occupancy cannot be negative"]
    },

    status: {
      type: String,
      enum: Object.values(LOCATION_STATUS),
      default: LOCATION_STATUS.OPEN
    },

    riskLevel: {
      type: String,
      enum: Object.values(RISK_LEVEL),
      default: RISK_LEVEL.LOW
    },

    facilities: {
      wheelchairAccessible: { type: Boolean, default: true },
      hasMedicalSupport: { type: Boolean, default: true },
      hasFoodSupplies: { type: Boolean, default: true },
      hasPowerBackup: { type: Boolean, default: true },
      hasDrinkingWater: { type: Boolean, default: true }
    },

    contactPhone: {
      type: String,
      trim: true,
      default: ""
    },

    evacuationNotes: {
      type: String,
      trim: true,
      default: "Proceed calmly along recommended evacuation paths."
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

safeLocationSchema.index({ location: "2dsphere" });

// Virtual to calculate available capacity
safeLocationSchema.virtual("availableSlots").get(function () {
  return Math.max(0, this.capacity - this.currentOccupancy);
});

const SafeLocation = mongoose.model("SafeLocation", safeLocationSchema);

export default SafeLocation;

