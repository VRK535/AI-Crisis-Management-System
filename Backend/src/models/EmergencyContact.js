import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true
        },

        name: {
            type: String,
            required: [true, "Contact name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"]
        },

        contactNumber: {
            type: String,
            required: [true, "Contact number is required"],
            trim: true
        },

        type: {
            type: String,
            enum: [
                "police",
                "fire",
                "ambulance",
                "family",
                "disaster_response",
                "other"
            ],
            required: [true, "Emergency contact type is required"]
        },

        description: {
            type: String,
            trim: true,
            maxlength: [300, "Description cannot exceed 300 characters"],
            default: ""
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

const EmergencyContact = mongoose.model(
    "EmergencyContact",
    emergencyContactSchema
);

export default EmergencyContact;