import { z } from "zod";

const emergencyContactTypes = [
    "police",
    "fire",
    "ambulance",
    "family",
    "disaster_response",
    "other"
];

export const createEmergencyContactSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Contact name must be at least 2 characters")
        .max(100, "Contact name cannot exceed 100 characters"),

    contactNumber: z
        .string()
        .trim()
        .min(3, "Contact number is required")
        .max(20, "Contact number cannot exceed 20 characters"),

    type: z
        .enum(emergencyContactTypes),

    description: z
        .string()
        .trim()
        .max(
            300,
            "Description cannot exceed 300 characters"
        )
        .optional()
        .default(""),

    isActive: z
        .boolean()
        .default(true)
});

export const updateEmergencyContactSchema =
    createEmergencyContactSchema.partial();