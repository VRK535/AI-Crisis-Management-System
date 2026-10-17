import { Router } from "express";
import {
  askChatbot,
  getKnowledgeBase,
  addKnowledgeItem,
} from "../controllers/chatbot.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  askChatbotSchema,
  createKnowledgeSchema,
} from "../validators/chatbot.validator.js";

const router = Router();

// Ask personalized RAG chatbot (requires login to use personal profile)
router.post(
  "/ask",
  authenticate,
  validate(askChatbotSchema),
  askChatbot
);

// View verified knowledge base (public)
router.get("/knowledge", getKnowledgeBase);

// Admin-only: add official disaster protocols to knowledge base
router.post(
  "/knowledge",
  authenticate,
  authorizeRoles("admin"),
  validate(createKnowledgeSchema),
  addKnowledgeItem
);

export default router;

