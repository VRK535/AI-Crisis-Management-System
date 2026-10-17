import React, { useState, useEffect } from "react";
import { incidentsApi, sosApi, safeLocationsApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardView() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [triageQueue, setTriageQueue] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOperationalData();
  }, []);

  const loadOperationalData = async () => {
    setLoading(true);
    try {
      const [dashRes, queueRes, shelterRes] = await Promise.all([
        incidentsApi.getDashboard(),
        sosApi.getTriageQueue().catch(() => ({ data: [] })),
        safeLocationsApi.getAll().catch(() => ({ data: [] })),
      ]);

      if (dashRes?.data) setDashboard(dashRes.data);
      if (queueRes?.data) setTriageQueue(queueRes.data);
      if (shelterRes?.data) setShelters(shelterRes.data);
    } catch (err) {
      console.warn("Could not load dashboard:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveSOS = async (sosId) => {
    try {
      await sosApi.resolve(sosId, "Resolved by Command Authority");
      loadOperationalData();
    } catch (err) {
      alert("Could not resolve SOS: " + err.message);
    }
  };

  const handleUpdateOccupancy = async (shelterId, currentVal, change) => {
    const newVal = Math.max(0, currentVal + change);
    try {
      await safeLocationsApi.updateOccupancy(shelterId, newVal);
      loadOperationalData();
    } catch (err) {
      alert("Occupancy update failed: " + err.message);
    }
  };

  const overview = dashboard?.overview || {};

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-white">Unified Operational Command Dashboard</h2>
            <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-bold">
              Authorities Live View
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Real-time rescue triage ranking, shelter occupancy flow, and disaster relief allocation.
          </p>
        </div>

        <button
          onClick={loadOperationalData}
          className="text-xs px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl transition font-bold"
        >
          🔄 Refresh Feed
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Pending Rescue SOS</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-red-500">{overview.pendingSOS || 0}</span>
            <span className="text-[10px] text-red-400 uppercase font-bold">High Urgency</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Active Crises</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-amber-400">
              {overview.activeCrisesCount || 0}
            </span>
            <span className="text-[10px] text-slate-400">Ongoing</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Shelter Occupancy Rate</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-blue-400">
              {overview.shelterOccupancyRate || "0%"}
            </span>
            <span className="text-[10px] text-slate-400">
              {overview.shelterOccupantsTotal || 0} / {overview.shelterCapacityTotal || 0}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Available Shelter Slots</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-emerald-400">
              {overview.availableShelterSlots || 0}
            </span>
            <span className="text-[10px] text-emerald-300">Slots Ready</span>
          </div>
        </div>
      </div>

      {/* Prioritized Rescue Triage Queue */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <span>🚨 AI-Prioritized Rescue Dispatch Queue</span>
              <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-bold">
                Triage Ranked
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked automatically by vulnerability algorithms (infants, seniors, asthma/medical conditions, crisis severity).
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400">{triageQueue.length} In Queue</span>
        </div>

        {triageQueue.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/60 rounded-xl border border-slate-850">
            No active emergencies in the dispatch queue. All cleared!
          </div>
        ) : (
          <div className="space-y-2.5">
            {triageQueue.map((item) => (
              <div
                key={item._id}
                className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-extrabold text-[11px]">
                      Priority {item.priorityScore} / 10
                    </span>
                    <span className="font-bold text-white text-sm">
                      {item.userId?.name || "Citizen"}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      📞 {item.userId?.phone || "N/A"}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex flex-wrap gap-2">
                    {item.userId?.age && <span>Age: {item.userId.age}</span>}
                    {item.userId?.medicalConditions?.length > 0 && (
                      <span className="text-amber-300">
                        🩺 Conditions: {item.userId.medicalConditions.join(", ")}
                      </span>
                    )}
                    {item.message && <span className="italic text-slate-300">"{item.message}"</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleResolveSOS(item._id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow transition"
                  >
                    ✓ Mark Rescued
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Shelter Capacity Manager */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-white">
          🏕️ Live Shelter Occupancy & Relief Flow Control
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shelters.map((s) => {
            const occ = s.currentOccupancy || 0;
            const cap = s.capacity || 100;
            const pct = Math.min(100, Math.round((occ / cap) * 100));

            return (
              <div
                key={s._id}
                className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{s.name}</span>
                  <span className="font-mono text-slate-400">
                    {occ} / {cap} ({pct}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      pct > 90 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Quick Responder Controls */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Available: <b>{Math.max(0, cap - occ)}</b>
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleUpdateOccupancy(s._id, occ, -5)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleUpdateOccupancy(s._id, occ, +5)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

