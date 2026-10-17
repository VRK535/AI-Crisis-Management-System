import { z } from "zod";
import { INCIDENT_STATUS, CRISIS_SEVERITY } from "../utils/constants.js";

const coordinatesSchema = z
  .array(z.number())
  .length(2, "Coordinates must contain [longitude, latitude]")
  .refine(
    ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
    { message: "Invalid GPS coordinates" }
  );

export const createIncidentSchema = z.object({
  crisisTypeId: z.string().optional().nullable(),

  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters"),

  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),

  severity: z
    .enum(Object.values(CRISIS_SEVERITY))
    .optional()
    .default(CRISIS_SEVERITY.MEDIUM),

  location: z.object({
    type: z.literal("Point").default("Point"),
    coordinates: coordinatesSchema,
  }),

  addressText: z.string().optional().default(""),

  reportedNeeds: z.array(z.string()).optional().default([]),

  affectedPeopleCount: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(1),

  mediaUrls: z.array(z.string()).optional().default([]),
});

export const updateIncidentStatusSchema = z.object({
  status: z.enum(Object.values(INCIDENT_STATUS)),
});

