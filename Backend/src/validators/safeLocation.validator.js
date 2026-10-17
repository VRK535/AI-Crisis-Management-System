import { z } from "zod";
import { SHELTER_TYPES, LOCATION_STATUS, RISK_LEVEL } from "../utils/constants.js";

const coordinatesSchema = z
  .array(z.number())
  .length(2, "Coordinates must contain [longitude, latitude]")
  .refine(
    ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
    { message: "Invalid GPS coordinates" }
  );

export const createSafeLocationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name cannot exceed 150 characters"),

  type: z.enum(Object.values(SHELTER_TYPES)),

  supportedCrisisTypes: z.array(z.string()).optional().default([]),

  location: z.object({
    type: z.literal("Point").default("Point"),
    coordinates: coordinatesSchema,
  }),

  address: z.object({
    street: z.string().optional().default(""),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().optional().default(""),
  }),

  elevationMeters: z.number().optional().default(0),

  capacity: z
    .number()
    .int("Capacity must be an integer")
    .min(1, "Capacity must be at least 1"),

  currentOccupancy: z
    .number()
    .int("Occupancy must be an integer")
    .min(0, "Occupancy cannot be negative")
    .optional()
    .default(0),

  status: z.enum(Object.values(LOCATION_STATUS)).optional().default(LOCATION_STATUS.OPEN),

  riskLevel: z.enum(Object.values(RISK_LEVEL)).optional().default(RISK_LEVEL.LOW),

  facilities: z
    .object({
      wheelchairAccessible: z.boolean().optional().default(true),
      hasMedicalSupport: z.boolean().optional().default(true),
      hasFoodSupplies: z.boolean().optional().default(true),
      hasPowerBackup: z.boolean().optional().default(true),
      hasDrinkingWater: z.boolean().optional().default(true),
    })
    .optional(),

  contactPhone: z.string().optional().default(""),
  evacuationNotes: z.string().optional().default("Proceed calmly along recommended evacuation paths."),
});

export const updateSafeLocationSchema = createSafeLocationSchema.partial();

export const updateOccupancySchema = z.object({
  currentOccupancy: z
    .number()
    .int("Occupancy must be an integer")
    .min(0, "Occupancy cannot be negative"),
});

