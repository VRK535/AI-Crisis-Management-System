import mongoose from "mongoose";

const crisisTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Crisis type name is required"],
            unique: true,
            trim: true,
            maxlength: [100, "Crisis type name cannot exceed 100 characters"]
        },

        description: {
            type: String,
            required: [true, "Crisis description is required"],
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"]
        },

        severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium"
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

const CrisisType = mongoose.model(
    "CrisisType",
    crisisTypeSchema
);

export default CrisisType;