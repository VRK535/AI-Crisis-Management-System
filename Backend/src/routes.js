import { Router } from "express";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import familyRoutes from "./routes/family.routes.js";
import addressRoutes from "./routes/address.routes.js";
import crisisRoutes from "./routes/crisis.routes.js";
import safetyRoutes from "./routes/safety.routes.js";
import emergencyRoutes from "./routes/emergency.routes.js";
import sosRoutes from "./routes/sos.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import safeLocationRoutes from "./routes/safeLocation.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import p2pRoutes from "./routes/p2p.routes.js";
import incidentRoutes from "./routes/incident.routes.js";

const router = Router();

// API version 1 routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/family", familyRoutes);
router.use("/addresses", addressRoutes);
router.use("/crises", crisisRoutes);
router.use("/safety-advisories", safetyRoutes);
router.use("/emergency-contacts", emergencyRoutes);
router.use("/sos", sosRoutes);
router.use("/notifications", notificationRoutes);

// Core Modules from AI-CMS Architecture:
router.use("/safe-locations", safeLocationRoutes);
router.use("/chatbot", chatbotRoutes);
router.use("/p2p", p2pRoutes);
router.use("/incidents", incidentRoutes);

export default router;