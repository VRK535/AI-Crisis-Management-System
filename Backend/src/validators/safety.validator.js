import { z } from "zod";

const stringArraySchema = z
    .array(
        z
            .string()
            .trim()
            .min(1, "Step cannot be empty")
            .max(500, "Step cannot exceed 500 characters")
    );

export const createSafetyAdvisorySchema = z.object({
    crisisTypeId: z
        .string()
        .min(1, "Crisis type ID is required"),

    title: z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(200, "Title cannot exceed 200 characters"),

    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters"),

    necessarySteps: stringArraySchema
        .min(1, "At least one necessary step is required"),

    dos: stringArraySchema
        .optional()
        .default([]),

    donts: stringArraySchema
        .optional()
        .default([]),

    priority: z
        .number()
        .int("Priority must be a whole number")
        .min(1, "Priority must be at least 1")
        .max(10, "Priority cannot exceed 10")
        .default(1),

    isActive: z
        .boolean()
        .default(true)
});

export const updateSafetyAdvisorySchema =
    createSafetyAdvisorySchema.partial();