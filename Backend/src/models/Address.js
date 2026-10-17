import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            unique: true,
            index: true
        },

        addressLine: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
            maxlength: [300, "Address cannot exceed 300 characters"]
        },

        city: {
            type: String,
            required: [true, "City is required"],
            trim: true
        },

        state: {
            type: String,
            required: [true, "State is required"],
            trim: true
        },

        pincode: {
            type: String,
            required: [true, "Pincode is required"],
            trim: true
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
                            coordinates.length === 2 &&
                            coordinates[0] >= -180 &&
                            coordinates[0] <= 180 &&
                            coordinates[1] >= -90 &&
                            coordinates[1] <= 90
                        );
                    },
                    message:
                        "Coordinates must be [longitude, latitude]"
                }
            }
        }
    },
    {
        timestamps: true
    }
);

addressSchema.index({
    location: "2dsphere"
});

const Address = mongoose.model("Address", addressSchema);

export default Address;