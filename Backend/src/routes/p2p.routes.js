import { Router } from "express";
import {
  registerPeer,
  getPeerPublicKey,
  syncMeshMessages,
} from "../controllers/p2p.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  registerPeerSchema,
  syncMeshMessagesSchema,
} from "../validators/p2p.validator.js";

const router = Router();

// All P2P mesh routes require authentication
router.use(authenticate);

// Register user device Bluetooth/Wi-Fi Direct keys
router.post("/register", validate(registerPeerSchema), registerPeer);

// Get target peer's public encryption key for encrypted chats
router.get("/peers/:userId", getPeerPublicKey);

// Sync offline stored mesh messages once reconnected
router.post("/sync-mesh", validate(syncMeshMessagesSchema), syncMeshMessages);

export default router;

