import mongoose from "mongoose";
import env from "./env.js";
import CrisisType from "../models/CrisisType.js";
import SafeLocation from "../models/SafeLocation.js";
import EmergencyContact from "../models/EmergencyContact.js";
import ChatbotKnowledge from "../models/ChatbotKnowledge.js";
import { SHELTER_TYPES, LOCATION_STATUS, RISK_LEVEL } from "../utils/constants.js";

async function seedData() {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected.");

    // 1. Seed Crisis Types
    await CrisisType.deleteMany({});
    const [flood, earthquake, pandemic, fire] = await CrisisType.create([
      {
        name: "Monsoon Flash Flood",
        description: "Severe urban and river flooding with rising water levels exceeding danger mark.",
        severity: "critical",
        isActive: true,
      },
      {
        name: "Earthquake (Magnitude 6.2)",
        description: "Severe ground shaking and structural risk in residential zones.",
        severity: "high",
        isActive: true,
      },
      {
        name: "Respiratory Viral Outbreak",
        description: "Highly contagious airborne respiratory infection requiring isolation.",
        severity: "medium",
        isActive: true,
      },
      {
        name: "Industrial Chemical Fire",
        description: "Dense toxic chemical smoke plume spreading through commercial corridor.",
        severity: "critical",
        isActive: true,
      },
    ]);
    console.log("✓ Seeded Crisis Types.");

    // 2. Seed Safe Locations (with coordinates around New Delhi / NCR)
    await SafeLocation.deleteMany({});
    await SafeLocation.create([
      {
        name: "Apex Elevated Disaster Relief Shelter",
        type: SHELTER_TYPES.FLOOD_SHELTER,
        supportedCrisisTypes: [flood._id],
        location: {
          type: "Point",
          coordinates: [77.215, 28.62], // Near Connaught Place elevated hall
        },
        address: {
          street: "Ridge High Road, Sector 3",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110001",
        },
        elevationMeters: 48, // Elevated above water table
        capacity: 450,
        currentOccupancy: 85,
        status: LOCATION_STATUS.OPEN,
        riskLevel: RISK_LEVEL.LOW,
        facilities: {
          wheelchairAccessible: true,
          hasMedicalSupport: true,
          hasFoodSupplies: true,
          hasPowerBackup: true,
          hasDrinkingWater: true,
        },
        contactPhone: "011-23344556",
        evacuationNotes: "Access via Ridge Road overpass. Avoid lower riverbank underpass.",
      },
      {
        name: "Central Open Stadium Assembly Ground",
        type: SHELTER_TYPES.EARTHQUAKE_ASSEMBLY,
        supportedCrisisTypes: [earthquake._id],
        location: {
          type: "Point",
          coordinates: [77.228, 28.608],
        },
        address: {
          street: "India Gate Perimeter Field",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110001",
        },
        elevationMeters: 18,
        capacity: 1200,
        currentOccupancy: 210,
        status: LOCATION_STATUS.OPEN,
        riskLevel: RISK_LEVEL.LOW,
        facilities: {
          wheelchairAccessible: true,
          hasMedicalSupport: true,
          hasFoodSupplies: true,
          hasPowerBackup: true,
          hasDrinkingWater: true,
        },
        contactPhone: "011-23388990",
        evacuationNotes: "Open sky area free of overhead power cables or high-rise glass structures.",
      },
      {
        name: "Metro District Emergency Hospital & Trauma Center",
        type: SHELTER_TYPES.HOSPITAL,
        supportedCrisisTypes: [flood._id, earthquake._id, pandemic._id, fire._id],
        location: {
          type: "Point",
          coordinates: [77.205, 28.618],
        },
        address: {
          street: "Ring Road Medical Enclave",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110029",
        },
        elevationMeters: 24,
        capacity: 300,
        currentOccupancy: 220,
        status: LOCATION_STATUS.OPEN,
        riskLevel: RISK_LEVEL.LOW,
        facilities: {
          wheelchairAccessible: true,
          hasMedicalSupport: true,
          hasFoodSupplies: true,
          hasPowerBackup: true,
          hasDrinkingWater: true,
        },
        contactPhone: "011-26588500",
        evacuationNotes: "Dedicated ambulance corridor open along Ring Road.",
      },
      {
        name: "North Community Isolation Care Center",
        type: SHELTER_TYPES.ISOLATION_CENTER,
        supportedCrisisTypes: [pandemic._id],
        location: {
          type: "Point",
          coordinates: [77.202, 28.625],
        },
        address: {
          street: "Civil Lines Quarantine Ward",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110054",
        },
        elevationMeters: 20,
        capacity: 200,
        currentOccupancy: 45,
        status: LOCATION_STATUS.OPEN,
        riskLevel: RISK_LEVEL.LOW,
        facilities: {
          wheelchairAccessible: true,
          hasMedicalSupport: true,
          hasFoodSupplies: true,
          hasPowerBackup: true,
          hasDrinkingWater: true,
        },
        contactPhone: "011-23912345",
        evacuationNotes: "Separate negative-pressure filtration chambers for infectious cases.",
      },
    ]);
    console.log("✓ Seeded Safe Locations.");

    // 3. Seed Emergency Helplines
    await EmergencyContact.deleteMany({});
    await EmergencyContact.create([
      {
        name: "National Emergency Service (All-in-One)",
        contactNumber: "112",
        type: "police",
        description: "24/7 Universal emergency response operator",
      },
      {
        name: "National Disaster Response Force (NDRF)",
        contactNumber: "1078",
        type: "disaster_response",
        description: "Disaster search, flood boat rescue and evacuation command",
      },
      {
        name: "Central Fire & Hazardous Material Rescue",
        contactNumber: "101",
        type: "fire",
        description: "Fire extinguishing, chemical leak mitigation, trapped extraction",
      },
      {
        name: "Emergency Medical & Trauma Ambulance",
        contactNumber: "108",
        type: "ambulance",
        description: "Paramedic equipped emergency patient transit",
      },
    ]);
    console.log("✓ Seeded Emergency Contacts.");

    // 4. Seed Curated Knowledge Base for Personalized RAG
    await ChatbotKnowledge.deleteMany({});
    await ChatbotKnowledge.create([
      {
        category: "flood_safety",
        title: "Flood Evacuation & High Ground Strategy",
        content: "Move immediately to designated elevated shelters (20m+ elevation). Never walk or drive through moving water. Even 6 inches of flowing water can sweep an adult off their feet. Switch off main electricity breakers before exiting.",
        actionSteps: [
          "Evacuate to elevated shelters or upper concrete floors immediately.",
          "Keep flashlights, dry food, and power banks in waterproof ziplock bags.",
          "Do NOT touch downed electric wires or submerged transformers.",
          "Boil or purify all water before drinking to avoid waterborne cholera/gastroenteritis.",
        ],
        tags: ["flood", "water", "high-ground", "elevation", "rain", "drowning"],
        sourceAuthority: "NDMA (National Disaster Management Authority)",
      },
      {
        category: "medical",
        title: "Disaster Action for Asthma & Respiratory Sufferers",
        content: "Disasters produce high particulate dust, smoke, humidity, and mold spores that rapidly trigger severe asthma attacks or COPD exacerbations. Keep rescue bronchodilators on your person.",
        actionSteps: [
          "Carry a minimum 14-day supply of inhalers and steroid medications in a waterproof pouch.",
          "Wear a tight-fitting N95 mask to filter airborne flood mold or smoke particulate.",
          "Avoid damp basements or dust-covered ground floors; choose well-ventilated upper levels.",
          "Notify shelter triage personnel immediately of your respiratory history upon arrival.",
        ],
        tags: ["asthma", "breathing", "inhaler", "copd", "dust", "smoke", "respiratory"],
        sourceAuthority: "WHO Global Emergency Health Directorate",
        targetConditions: ["Asthma", "COPD", "Respiratory"],
      },
      {
        category: "elderly_care",
        title: "Senior Citizens & Mobility-Impaired Evacuation",
        content: "Older adults (60+) and individuals with arthritis, cardiovascular disease, or mobility limitations require priority assisted evacuation. Never use building elevators during disasters.",
        actionSteps: [
          "Keep walking canes, wheelchairs, hearing aids, and glasses beside the bed.",
          "Attach a laminated card to senior clothing with blood group, allergies, and contact phone.",
          "Request early transport assistance from local emergency volunteers before roads flood.",
          "Select shelters equipped with accessibility ramps and ground-floor medical bays.",
        ],
        tags: ["elderly", "senior", "mobility", "wheelchair", "walker", "cardiac"],
        sourceAuthority: "Red Cross Disaster Guidance for Vulnerable Groups",
        targetConditions: ["Mobility Impairment", "Cardiac Disease", "Hypertension"],
        applicableAgeGroup: { minAge: 60, maxAge: 120 },
      },
    ]);
    console.log("✓ Seeded Chatbot Knowledge Base.");

    console.log(" Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
}

seedData();

