import ChatbotKnowledge from "../models/ChatbotKnowledge.js";
import User from "../models/User.js";
import FamilyMember from "../models/FamilyMember.js";
import SafeLocation from "../models/SafeLocation.js";
import CrisisType from "../models/CrisisType.js";

// Curated verified default protocols for cold-start / baseline RAG retrieval
const DEFAULT_KNOWLEDGE_BASE = [
  {
    category: "flood_safety",
    title: "Flood Evacuation and High Ground Safety",
    content: "Move immediately to higher ground or an elevated flood shelter. Avoid walking or driving through moving water (6 inches can knock you down, 2 feet can float a vehicle). Disconnect electrical appliances before evacuating.",
    actionSteps: [
      "Head to designated elevated shelters or roofs if trapped.",
      "Pack essential medicines, IDs, and drinking water in waterproof plastic bags.",
      "Do NOT attempt to cross flowing streams or flooded underpasses.",
      "Boil tap water or drink only bottled/purified water to prevent waterborne diseases."
    ],
    tags: ["flood", "water", "evacuation", "shelter", "high-ground"],
    sourceAuthority: "NDMA (National Disaster Management Authority)",
    targetConditions: [],
    applicableAgeGroup: { minAge: 0, maxAge: 120 }
  },
  {
    category: "medical",
    title: "Emergency Protocols for Respiratory Conditions (Asthma / COPD) during Disasters",
    content: "During disasters, smoke, dust, humidity, or floodwater mold can rapidly trigger acute asthma or respiratory attacks. Keep prescribed rescue inhalers on person at all times in a sealed ziplock pouch.",
    actionSteps: [
      "Carry at least a 7-day supply of rescue inhalers and maintenance medicine.",
      "Wear an N95 or multi-layered mask to filter particulate matter, flood mold, or wildfire smoke.",
      "Avoid damp basement shelters; choose well-ventilated upper-floor assembly areas.",
      "Alert shelter medical personnel immediately upon arrival about respiratory history."
    ],
    tags: ["asthma", "respiratory", "inhaler", "breathing", "copd", "dust", "smoke"],
    sourceAuthority: "WHO Emergency Health Guidelines",
    targetConditions: ["Asthma", "COPD", "Respiratory"],
    applicableAgeGroup: { minAge: 0, maxAge: 120 }
  },
  {
    category: "elderly_care",
    title: "Evacuation Protocol for Elderly and Mobility-Impaired Individuals",
    content: "Senior citizens (age 60+) and individuals with limited mobility require assisted evacuation planning. Do not use elevators during emergencies.",
    actionSteps: [
      "Keep walking aids, wheelchairs, and eyeglasses within arm's reach.",
      "Label emergency go-bags with full medical history, blood group, and emergency contact numbers.",
      "Request early evacuation transport before road conditions deteriorate.",
      "Select wheelchair-accessible ground-floor or ramp-equipped evacuation shelters."
    ],
    tags: ["elderly", "senior", "mobility", "wheelchair", "assisted", "walking"],
    sourceAuthority: "Red Cross & NDMA Senior Safety Directive",
    targetConditions: ["Mobility Impairment", "Arthritis", "Cardiac"],
    applicableAgeGroup: { minAge: 60, maxAge: 120 }
  },
  {
    category: "earthquake_safety",
    title: "Earthquake Drop, Cover, and Hold Protocol",
    content: "During ground shaking: DROP to the ground, take COVER under a sturdy desk or table, and HOLD ON until shaking stops. Stay away from windows, glass, and exterior walls.",
    actionSteps: [
      "If indoors, Drop, Cover, Hold. Do NOT run outside while shaking continues.",
      "If outdoors, move away from buildings, streetlights, and power cables to an open assembly ground.",
      "After shaking stops, check for gas leaks and structural damage before moving.",
      "Proceed only via stairs; never enter elevators."
    ],
    tags: ["earthquake", "tremor", "drop-cover-hold", "assembly", "shaking"],
    sourceAuthority: "NDMA Earthquake Response Protocol",
    targetConditions: [],
    applicableAgeGroup: { minAge: 0, maxAge: 120 }
  },
  {
    category: "pandemic_safety",
    title: "Infection Control and Isolation Guidelines",
    content: "During outbreaks, maintain physical distancing, wear certified masks, and isolate symptomatic individuals immediately in ventilated rooms or designated isolation centers.",
    actionSteps: [
      "Maintain a 2-meter physical distance from non-household members.",
      "Wash hands thoroughly with soap or alcohol sanitizer for at least 20 seconds.",
      "Report fever and symptoms to designated triage hospitals or telemedicine hotlines.",
      "Use Bluetooth/Wi-Fi peer-to-peer contactless communication to minimize physical contact."
    ],
    tags: ["pandemic", "virus", "infection", "isolation", "quarantine", "mask"],
    sourceAuthority: "WHO Global Outbreak Protocol",
    targetConditions: ["Immunocompromised", "Diabetes"],
    applicableAgeGroup: { minAge: 0, maxAge: 120 }
  }
];

class ChatbotService {
  // Personalized RAG Answer Generation
  async askQuestion(userId, { query, crisisTypeId = null, currentLocation = null, conversationHistory = [] }) {
    // 1. Retrieve User profile & personal medical/family context
    const user = await User.findById(userId).select(
      "name age bloodGroup medicalConditions specialNeeds"
    );

    const familyMembers = await FamilyMember.find({ userId }).select(
      "name relation age bloodGroup"
    );

    const activeCrisis = crisisTypeId
      ? await CrisisType.findById(crisisTypeId).select("name severity description")
      : null;

    // 2. Perform Retrieval over ChatbotKnowledge + Baseline Protocols
    const retrievedDocs = await this.retrieveRelevantKnowledge(query, user, activeCrisis);

    // 3. Optional nearby shelter lookup if user provided GPS coordinates
    let nearestShelter = null;
    if (currentLocation?.coordinates?.length === 2) {
      try {
        const [lng, lat] = currentLocation.coordinates;
        const shelters = await SafeLocation.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [lng, lat] },
              distanceField: "distanceMeters",
              maxDistance: 25000,
              spherical: true,
              query: { isActive: true, status: "open" },
            },
          },
          { $limit: 1 },
        ]);
        if (shelters.length > 0) {
          nearestShelter = shelters[0];
        }
      } catch {
        // Safe fallback if geo query not available
      }
    }

    // 4. Synthesize Personalized RAG Response
    const personalizedResponse = this.generateGroundedResponse({
      query,
      user,
      familyMembers,
      activeCrisis,
      retrievedDocs,
      nearestShelter,
    });

    return personalizedResponse;
  }

  // Knowledge retrieval using keyword, condition, and category matching
  async retrieveRelevantKnowledge(query, user, activeCrisis) {
    const queryLower = query.toLowerCase();
    const userConditions = (user?.medicalConditions || []).map((c) => c.toLowerCase());
    const isElderly = (user?.age || 0) >= 60;

    // Search MongoDB collection
    const searchTerms = queryLower.split(" ").filter((w) => w.length > 3);
    const dbDocs = await ChatbotKnowledge.find({
      isActive: true,
      $or: [
        { tags: { $in: searchTerms } },
        { targetConditions: { $in: user?.medicalConditions || [] } },
        ...(activeCrisis ? [{ crisisTypeId: activeCrisis._id }] : []),
      ],
    }).limit(4);

    // Combine with verified default protocols
    const allCandidates = [...dbDocs, ...DEFAULT_KNOWLEDGE_BASE];

    // Score candidates based on relevance to query & user personal health profile
    const scoredDocs = allCandidates.map((doc) => {
      let score = 0;

      // Query keyword match
      const docText = `${doc.title} ${doc.content} ${(doc.tags || []).join(" ")}`.toLowerCase();
      searchTerms.forEach((term) => {
        if (docText.includes(term)) score += 3;
      });

      // Medical condition relevance (Personalized boost)
      (doc.targetConditions || []).forEach((cond) => {
        if (userConditions.includes(cond.toLowerCase())) {
          score += 5;
        }
      });

      // Age category relevance
      if (isElderly && (doc.tags || []).includes("elderly")) score += 4;

      return { doc, score };
    });

    // Sort by relevance score
    scoredDocs.sort((a, b) => b.score - a.score);

    const bestDocs = scoredDocs
      .filter((item) => item.score > 0)
      .slice(0, 3)
      .map((item) => item.doc);

    // If no specific match, provide general baseline
    return bestDocs.length > 0 ? bestDocs : [DEFAULT_KNOWLEDGE_BASE[0]];
  }

  // Synthesize grounded, personalized guidance
  generateGroundedResponse({
    query,
    user,
    familyMembers,
    activeCrisis,
    retrievedDocs,
    nearestShelter,
  }) {
    const userName = user?.name || "Citizen";
    const conditions = user?.medicalConditions || [];
    const specialNeeds = user?.specialNeeds || "";
    const isSenior = (user?.age || 0) >= 60;

    // Detect vulnerable family members
    const elderlyFamily = familyMembers.filter((f) => f.age >= 65);
    const childFamily = familyMembers.filter((f) => f.age <= 6);

    const personalizedNotes = [];

    // Personal health warnings
    if (conditions.length > 0) {
      personalizedNotes.push(
        `• **Personal Health Notice**: We noticed your profile lists: **${conditions.join(
          ", "
        )}**. Please ensure you have your medication kit and prescriptions packed in a waterproof container.`
      );
    }

    if (isSenior) {
      personalizedNotes.push(
        `• **Senior Safety Guidance**: At age ${user.age}, please avoid strenuous manual evacuation paths and utilize ramp-accessible or assisted evacuation transport.`
      );
    }

    if (specialNeeds) {
      personalizedNotes.push(`• **Special Care Note**: Keep requirements for "${specialNeeds}" prioritized.`);
    }

    // Family consideration notes
    if (elderlyFamily.length > 0) {
      personalizedNotes.push(
        `• **Family Care (Seniors)**: Assist family member(s) ${elderlyFamily
          .map((f) => `${f.name} (${f.age} yrs)`)
          .join(", ")} first, ensuring their walking aids and medicines are kept ready.`
      );
    }

    if (childFamily.length > 0) {
      personalizedNotes.push(
        `• **Family Care (Children)**: For young children (${childFamily
          .map((f) => f.name)
          .join(", ")}), keep emergency identification tags with your contact details attached to their clothing.`
      );
    }

    // Extract action steps and source citations from retrieved docs
    const verifiedActionSteps = [];
    const citations = [];

    retrievedDocs.forEach((doc) => {
      if (doc.actionSteps && doc.actionSteps.length > 0) {
        verifiedActionSteps.push(...doc.actionSteps);
      }
      if (doc.sourceAuthority && !citations.includes(doc.sourceAuthority)) {
        citations.push(doc.sourceAuthority);
      }
    });

    // Shelter navigation note
    let shelterAdvice = "";
    if (nearestShelter) {
      const distKm = (nearestShelter.distanceMeters / 1000).toFixed(1);
      shelterAdvice = `\n\n📍 **Recommended Safe Shelter**: **${nearestShelter.name}** is located approximately **${distKm} km** away (${nearestShelter.address?.city || ""}). Current status: **${nearestShelter.status.toUpperCase()}** with capacity available.`;
    }

    const uniqueSteps = [...new Set(verifiedActionSteps)].slice(0, 5);

    const responseText = [
      `Hello ${userName}. Based on verified emergency protocols${
        activeCrisis ? ` for the ongoing **${activeCrisis.name}**` : ""
      }, here is your tailored safety guidance:\n`,
      personalizedNotes.length > 0 ? `**Personalized Profile Advisory:**\n${personalizedNotes.join("\n")}\n` : "",
      uniqueSteps.length > 0 ? `**Immediate Recommended Actions:**\n${uniqueSteps.map((s) => `1. ${s}`).join("\n")}` : "",
      shelterAdvice,
      `\n\n🛡️ *Grounded in verified emergency standards by:* ${citations.join(", ") || "NDMA & WHO"}.`,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      query,
      answer: responseText,
      groundedSources: citations,
      personalizedFactors: {
        userAge: user?.age,
        medicalConditions: conditions,
        familyCount: familyMembers.length,
        vulnerableMembersCount: elderlyFamily.length + childFamily.length,
      },
      recommendedShelter: nearestShelter
        ? {
            id: nearestShelter._id,
            name: nearestShelter.name,
            type: nearestShelter.type,
            distanceKm: Number((nearestShelter.distanceMeters / 1000).toFixed(2)),
          }
        : null,
      timestamp: new Date().toISOString(),
    };
  }

  // Get curated knowledge list
  async getKnowledgeBase(category = "") {
    const filter = { isActive: true };
    if (category) filter.category = category;
    return ChatbotKnowledge.find(filter).sort({ createdAt: -1 });
  }

  // Admin: Add protocol to knowledge base
  async addKnowledgeItem(data) {
    return ChatbotKnowledge.create(data);
  }
}

export default new ChatbotService();

