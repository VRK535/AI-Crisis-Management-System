import { z } from "zod";

const coordinatesSchema = z
  .array(z.number())
  .length(2, "Coordinates must contain [longitude, latitude]")
  .refine(
    ([longitude, latitude]) =>
      longitude >= -180 &&
      longitude <= 180 &&
      latitude >= -90 &&
      latitude <= 90,
    {
      message: "Invalid coordinates. Expected [longitude, latitude]",
    }
  );

export const createSOSSchema = z.object({
  crisisTypeId: z.string().optional().nullable(),

  location: z.object({
    type: z.literal("Point").default("Point"),
    coordinates: coordinatesSchema,
  }),

  message: z
    .string()
    .trim()
    .max(500, "SOS message cannot exceed 500 characters")
    .optional()
    .default(""),

  medicalEmergency: z.boolean().optional().default(false),

  peopleCount: z.number().int().min(1).optional().default(1),
});