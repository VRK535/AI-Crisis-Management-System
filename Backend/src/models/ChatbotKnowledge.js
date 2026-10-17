import mongoose from "mongoose";

const chatbotKnowledgeSchema = new mongoose.Schema(
  {
    crisisTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrisisType",
      default: null,
      index: true
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
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
        "special_needs"
      ],
      index: true
    },

    title: {
      type: String,
      required: [true, "Knowledge item title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },

    content: {
      type: String,
      required: [true, "Knowledge item content is required"],
      trim: true
    },

    actionSteps: {
      type: [String],
      default: []
    },

    tags: {
      type: [String],
      default: [],
      index: true
    },

    sourceAuthority: {
      type: String,
      default: "National Disaster Management Authority (NDMA)",
      trim: true
    },

    targetConditions: {
      type: [String],
      default: [] // e.g. ["Asthma", "Diabetes", "Mobility Impairment"]
    },

    applicableAgeGroup: {
      minAge: { type: Number, default: 0 },
      maxAge: { type: Number, default: 120 }
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

chatbotKnowledgeSchema.index({
  title: "text",
  content: "text",
  tags: "text"
});

const ChatbotKnowledge = mongoose.model("ChatbotKnowledge", chatbotKnowledgeSchema);

export default ChatbotKnowledge;

