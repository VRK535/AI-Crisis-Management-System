import { z } from "zod";

export const createCrisisSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Crisis type name must be at least 2 characters")
        .max(
            100,
            "Crisis type name cannot exceed 100 characters"
        ),

    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters")
        .max(
            1000,
            "Description cannot exceed 1000 characters"
        ),

    severity: z
        .enum(["low", "medium", "high", "critical"])
        .default("medium"),

    isActive: z
        .boolean()
        .default(true)
});

export const updateCrisisSchema =
    createCrisisSchema.partial();