import mongoose from "mongoose";
import { BLOOD_GROUPS, FAMILY_RELATIONS } from "../utils/constants.js";

const familyMemberSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true
        },

        name: {
            type: String,
            required: [true, "Family member name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"]
        },

        relation: {
            type: String,
            required: [true, "Family relation is required"],
            enum: Object.values(FAMILY_RELATIONS)
        },

        age: {
            type: Number,
            required: [true, "Age is required"],
            min: [0, "Age cannot be negative"],
            max: [120, "Age cannot exceed 120"]
        },

        bloodGroup: {
            type: String,
            required: [true, "Blood group is required"],
            enum: BLOOD_GROUPS
        },

        phone: {
            type: String,
            trim: true,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const FamilyMember = mongoose.model(
    "FamilyMember",
    familyMemberSchema
);

export default FamilyMember;