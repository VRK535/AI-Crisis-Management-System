import p2pService from "../services/p2p.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// POST /api/v1/p2p/register
export const registerPeer = asyncHandler(async (req, res) => {
  const result = await p2pService.registerPeer(req.user.id, req.body);

  res.status(200).json(
    new ApiResponse(200, result, "P2P peer registered successfully")
  );
});

// GET /api/v1/p2p/peers/:userId
export const getPeerPublicKey = asyncHandler(async (req, res) => {
  const result = await p2pService.getPeerPublicKey(req.params.userId);

  res.status(200).json(
    new ApiResponse(200, result, "Peer public key retrieved successfully")
  );
});

// POST /api/v1/p2p/sync-mesh
export const syncMeshMessages = asyncHandler(async (req, res) => {
  const { messages } = req.body;
  const result = await p2pService.syncMeshMessages(req.user.id, messages);

  res.status(200).json(
    new ApiResponse(200, result, "Offline mesh messages synced successfully")
  );
});

