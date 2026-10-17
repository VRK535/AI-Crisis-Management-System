import { apiRequest } from "./client.js";

// ==================== AUTH & USER ====================
export const authApi = {
  login: (data) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getProfile: () => apiRequest("/users/profile"),
  updateProfile: (data) => apiRequest("/users/profile", { method: "PATCH", body: JSON.stringify(data) }),
};

// ==================== SAFE LOCATIONS ====================
export const safeLocationsApi = {
  getNearby: ({ longitude, latitude, crisisTypeId, shelterType, maxDistance, wheelchairAccessible }) => {
    const params = new URLSearchParams({
      longitude: String(longitude),
      latitude: String(latitude),
      ...(crisisTypeId ? { crisisTypeId } : {}),
      ...(shelterType ? { shelterType } : {}),
      ...(maxDistance ? { maxDistance: String(maxDistance) } : {}),
      ...(wheelchairAccessible ? { wheelchairAccessible: "true" } : {}),
    });
    return apiRequest(`/safe-locations/nearby?${params.toString()}`);
  },
  getOfflineCache: (city = "") => apiRequest(`/safe-locations/offline-cache?city=${encodeURIComponent(city)}`),
  getAll: () => apiRequest("/safe-locations"),
  updateOccupancy: (id, currentOccupancy) =>
    apiRequest(`/safe-locations/${id}/occupancy`, {
      method: "PATCH",
      body: JSON.stringify({ currentOccupancy }),
    }),
};

// ==================== PERSONALIZED RAG CHATBOT ====================
export const chatbotApi = {
  ask: ({ query, crisisTypeId, currentLocation, conversationHistory }) =>
    apiRequest("/chatbot/ask", {
      method: "POST",
      body: JSON.stringify({
        query,
        crisisTypeId: crisisTypeId || null,
        currentLocation: currentLocation || null,
        conversationHistory: conversationHistory || [],
      }),
    }),
  getKnowledge: (category = "") => apiRequest(`/chatbot/knowledge?category=${encodeURIComponent(category)}`),
};

// ==================== OFFLINE P2P CHAT & MESH ====================
export const p2pApi = {
  registerPeer: (data) => apiRequest("/p2p/register", { method: "POST", body: JSON.stringify(data) }),
  getPeerKey: (userId) => apiRequest(`/p2p/peers/${userId}`),
  syncMesh: (messages) => apiRequest("/p2p/sync-mesh", { method: "POST", body: JSON.stringify({ messages }) }),
};

// ==================== SOS ALERT & RESCUE TRIAGE ====================
export const sosApi = {
  trigger: (data) => apiRequest("/sos", { method: "POST", body: JSON.stringify(data) }),
  getHistory: () => apiRequest("/sos"),
  cancel: (sosId) => apiRequest(`/sos/${sosId}/cancel`, { method: "PATCH" }),
  getTriageQueue: () => apiRequest("/sos/triage/queue"),
  resolve: (sosId, notes = "") =>
    apiRequest(`/sos/${sosId}/resolve`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    }),
};

// ==================== INCIDENTS & DECISION DASHBOARD ====================
export const incidentsApi = {
  report: (data) => apiRequest("/incidents", { method: "POST", body: JSON.stringify(data) }),
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/incidents${q ? `?${q}` : ""}`);
  },
  getDashboard: () => apiRequest("/incidents/dashboard/operational"),
  updateStatus: (id, status) =>
    apiRequest(`/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// ==================== FAMILY MEMBERS ====================
export const familyApi = {
  getAll: () => apiRequest("/family"),
  add: (data) => apiRequest("/family", { method: "POST", body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/family/${id}`, { method: "DELETE" }),
};

// ==================== CRISIS TYPES & ADVISORIES ====================
export const crisisApi = {
  getCrises: () => apiRequest("/crises"),
  getAdvisories: () => apiRequest("/safety-advisories"),
  getEmergencyContacts: () => apiRequest("/emergency-contacts"),
};

