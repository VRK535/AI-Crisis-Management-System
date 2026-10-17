import { z } from "zod";

const coordinatesSchema = z
    .array(z.number())
    .length(2, "Coordinates must contain longitude and latitude")
    .refine(
        ([longitude, latitude]) =>
            longitude >= -180 &&
            longitude <= 180 &&
            latitude >= -90 &&
            latitude <= 90,
        {
            message:
                "Invalid coordinates. Expected [longitude, latitude]"
        }
    );

export const createAddressSchema = z.object({
    addressLine: z
        .string()
        .trim()
        .min(5, "Address must be at least 5 characters")
        .max(300, "Address cannot exceed 300 characters"),

    city: z
        .string()
        .trim()
        .min(2, "City is required")
        .max(100, "City cannot exceed 100 characters"),

    state: z
        .string()
        .trim()
        .min(2, "State is required")
        .max(100, "State cannot exceed 100 characters"),

    pincode: z
        .string()
        .trim()
        .regex(
            /^[1-9][0-9]{5}$/,
            "Please provide a valid 6-digit Indian pincode"
        ),

    location: z.object({
        type: z.literal("Point"),

        coordinates: coordinatesSchema
    })
});

export const updateAddressSchema =
    createAddressSchema.partial();