import { z } from "zod";
import { BLOOD_GROUPS } from "../utils/constants.js";

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),

    email: z
      .string()
      .trim()
      .email("Please provide a valid email")
      .transform((value) => value.toLowerCase())
      .optional(),

    phone: z
      .string()
      .trim()
      .regex(
        /^[6-9]\d{9}$/,
        "Please provide a valid 10-digit Indian mobile number"
      )
      .optional(),

    age: z
      .number()
      .int()
      .min(0)
      .max(120)
      .optional(),

    bloodGroup: z
      .enum(BLOOD_GROUPS)
      .optional(),

    medicalConditions: z
      .array(z.string())
      .optional(),

    specialNeeds: z
      .string()
      .max(500)
      .optional(),

    devicePublicKey: z
      .string()
      .optional(),

    p2pPeerId: z
      .string()
      .optional(),

    lastLocation: z
      .object({
        type: z.literal("Point").default("Point"),
        coordinates: z.array(z.number()).length(2),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });