import { z } from "zod";

export const registerPeerSchema = z.object({
  p2pPeerId: z.string().trim().min(3, "Peer identifier is required"),
  devicePublicKey: z.string().trim().min(10, "Public encryption key is required"),
  deviceName: z.string().optional().default("Mobile Device"),
  bluetoothSupported: z.boolean().optional().default(true),
  wifiDirectSupported: z.boolean().optional().default(true),
});

export const syncMeshMessagesSchema = z.object({
  messages: z.array(
    z.object({
      senderPeerId: z.string(),
      recipientPeerId: z.string().optional().nullable(),
      encryptedPayload: z.string(),
      messageType: z.enum(["sos", "safety_check", "chat", "incident"]).default("chat"),
      timestamp: z.string().or(z.number()),
      bridgeRelayed: z.boolean().default(true),
    })
  ),
});

