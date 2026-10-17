import { z } from "zod";
import { BLOOD_GROUPS } from "../utils/constants.js";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .transform((value) => value.toLowerCase()),

  phone: z
    .string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "Please provide a valid 10-digit Indian mobile number"
    ),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),

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
    .optional()
    .default([]),

  specialNeeds: z
    .string()
    .max(500)
    .optional()
    .default(""),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),

  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .max(100, "New password cannot exceed 100 characters"),
});