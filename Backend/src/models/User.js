import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLES, BLOOD_GROUPS } from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER
    },

    // Extended profile for Personalized RAG & Crisis Triage
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      max: [120, "Age cannot exceed 120"],
      default: null
    },

    bloodGroup: {
      type: String,
      enum: [...BLOOD_GROUPS, null],
      default: null
    },

    medicalConditions: {
      type: [String],
      default: [] // e.g. ["Asthma", "Diabetes", "Mobility Impairment", "Cardiac"]
    },

    specialNeeds: {
      type: String,
      trim: true,
      maxlength: [500, "Special needs cannot exceed 500 characters"],
      default: ""
    },

    // Offline Peer-to-Peer Chat & Mesh support
    devicePublicKey: {
      type: String,
      trim: true,
      default: null
    },

    p2pPeerId: {
      type: String,
      trim: true,
      default: null
    },

    // Last known GPS coordinates for rapid disaster alert delivery
    lastLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },

    isActive: {
      type: Boolean,
      default: true
    },

    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ lastLocation: "2dsphere" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;