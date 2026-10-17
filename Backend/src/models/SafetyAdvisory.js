import mongoose from "mongoose";

const safetyAdvisorySchema = new mongoose.Schema(
    {
        crisisTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CrisisType",
            required: [true, "Crisis type is required"],
            index: true
        },

        title: {
            type: String,
            required: [true, "Advisory title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"]
        },

        description: {
            type: String,
            required: [true, "Advisory description is required"],
            trim: true
        },

        necessarySteps: {
            type: [String],
            required: true,
            validate: {
                validator: function (steps) {
                    return steps.length > 0;
                },
                message: "At least one necessary step is required"
            }
        },

        dos: {
            type: [String],
            default: []
        },

        donts: {
            type: [String],
            default: []
        },

        priority: {
            type: Number,
            default: 1,
            min: 1,
            max: 10
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

const SafetyAdvisory = mongoose.model(
    "SafetyAdvisory",
    safetyAdvisorySchema
);

export default SafetyAdvisory;