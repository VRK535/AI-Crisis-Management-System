import chatbotService from "../services/chatbot.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// POST /api/v1/chatbot/ask
export const askChatbot = asyncHandler(async (req, res) => {
  const answer = await chatbotService.askQuestion(req.user.id, req.body);

  res.status(200).json(
    new ApiResponse(200, answer, "Personalized guidance generated successfully")
  );
});

// GET /api/v1/chatbot/knowledge
export const getKnowledgeBase = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const items = await chatbotService.getKnowledgeBase(category);

  res.status(200).json(
    new ApiResponse(200, items, "Knowledge base retrieved successfully")
  );
});

// POST /api/v1/chatbot/knowledge
export const addKnowledgeItem = asyncHandler(async (req, res) => {
  const item = await chatbotService.addKnowledgeItem(req.body);

  res.status(201).json(
    new ApiResponse(201, item, "Knowledge item added successfully")
  );
});

