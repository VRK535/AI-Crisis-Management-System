import { z } from "zod";
import {
    BLOOD_GROUPS,
    FAMILY_RELATIONS
} from "../utils/constants.js";

export const createFamilyMemberSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),

    relation: z
        .enum(Object.values(FAMILY_RELATIONS))
        .or(z.string().min(1, "Relation is required")),

    age: z
        .number()
        .int("Age must be a whole number")
        .min(0, "Age cannot be negative")
        .max(120, "Age cannot exceed 120"),

    bloodGroup: z
        .enum(BLOOD_GROUPS),

    phone: z
        .string()
        .trim()
        .regex(
            /^[6-9]\d{9}$/,
            "Please provide a valid 10-digit Indian mobile number"
        )
        .optional()
        .or(z.literal(""))
});

export const updateFamilyMemberSchema = createFamilyMemberSchema.partial();