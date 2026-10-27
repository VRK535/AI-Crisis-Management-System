import React, { createContext, useContext, useState, useEffect } from "react";
import { safeLocationsApi, p2pApi } from "../api/index.js";

const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineSafeZones, setOfflineSafeZones] = useState(() => {
    try {
      const data = localStorage.getItem("offline_safe_zones");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const [meshMessages, setMeshMessages] = useState(() => {
    try {
      const data = localStorage.getItem("offline_mesh_messages");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => localStorage.getItem("last_mesh_sync") || null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-attempt mesh sync if there are pending buffered messages
      syncPendingMeshMessages();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Download safe zones for offline use
  const downloadSafeZonesForOffline = async (city = "") => {
    try {
      const res = await safeLocationsApi.getOfflineCache(city);
      if (res?.data?.safeZones) {
        setOfflineSafeZones(res.data.safeZones);
        localStorage.setItem("offline_safe_zones", JSON.stringify(res.data.safeZones));
        return res.data;
      }
    } catch (err) {
      console.warn("Could not download offline safe zones:", err.message);
      throw err;
    }
  };

  const saveSafeZonesOffline = (safeZones, location) => {
    localStorage.setItem("offline_safe_zones", JSON.stringify(safeZones));
    localStorage.setItem("offline_safe_zones_location", JSON.stringify(location));
    setOfflineSafeZones(safeZones);
  };

  // Add an offline mesh message to buffer
  const queueOfflineMeshMessage = (msg) => {
    const updated = [
      ...meshMessages,
      {
        ...msg,
        id: `mesh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
      },
    ];
    setMeshMessages(updated);
    localStorage.setItem("offline_mesh_messages", JSON.stringify(updated));
  };

  // Sync buffered mesh messages to backend
  const syncPendingMeshMessages = async () => {
    const saved = localStorage.getItem("offline_mesh_messages");
    const currentMessages = saved ? JSON.parse(saved) : [];

    if (currentMessages.length === 0 || !navigator.onLine) return;

    setSyncing(true);
    try {
      const res = await p2pApi.syncMesh(currentMessages);
      if (res?.data?.success) {
        setMeshMessages([]);
        localStorage.removeItem("offline_mesh_messages");
        const now = new Date().toLocaleTimeString();
        setLastSyncTime(now);
        localStorage.setItem("last_mesh_sync", now);
      }
    } catch (err) {
      console.warn("Mesh message sync failed:", err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        offlineSafeZones,
        meshMessages,
        syncing,
        lastSyncTime,
        downloadSafeZonesForOffline,
        saveSafeZonesOffline,
        queueOfflineMeshMessage,
        syncPendingMeshMessages,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
}
