import { z } from "zod";

export const askChatbotSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Question or message is required")
    .max(1000, "Query cannot exceed 1000 characters"),

  crisisTypeId: z.string().optional().nullable(),

  currentLocation: z
    .object({
      coordinates: z.array(z.number()).length(2),
    })
    .optional(),

  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export const createKnowledgeSchema = z.object({
  crisisTypeId: z.string().optional().nullable(),

  category: z.enum([
    "general",
    "evacuation",
    "medical",
    "first_aid",
    "flood_safety",
    "earthquake_safety",
    "pandemic_safety",
    "fire_safety",
    "cyclone_safety",
    "elderly_care",
    "children_safety",
    "special_needs",
  ]),

  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title cannot exceed 200 characters"),

  content: z.string().trim().min(5, "Content is required"),

  actionSteps: z.array(z.string()).optional().default([]),

  tags: z.array(z.string()).optional().default([]),

  sourceAuthority: z.string().optional().default("National Disaster Management Authority (NDMA)"),

  targetConditions: z.array(z.string()).optional().default([]),

  applicableAgeGroup: z
    .object({
      minAge: z.number().default(0),
      maxAge: z.number().default(120),
    })
    .optional(),
});

