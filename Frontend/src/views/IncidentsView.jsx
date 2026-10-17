import React, { useState, useEffect } from "react";
import { incidentsApi, crisisApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";

const COMMON_NEEDS = [
  "Clean Drinking Water",
  "Medical Assistance",
  "Evacuation Boat",
  "Dry Food Rations",
  "Power / Flashlight",
  "Blankets / Shelter",
];

export default function IncidentsView() {
  const { isAuthenticated } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [crises, setCrises] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [crisisTypeId, setCrisisTypeId] = useState("");
  const [severity, setSeverity] = useState("high");
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [affectedCount, setAffectedCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [incRes, crRes] = await Promise.all([
        incidentsApi.getAll(),
        crisisApi.getCrises(),
      ]);
      if (incRes?.data) setIncidents(incRes.data);
      if (crRes?.data) setCrises(crRes.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const toggleNeed = (need) => {
    if (selectedNeeds.includes(need)) {
      setSelectedNeeds(selectedNeeds.filter((n) => n !== need));
    } else {
      setSelectedNeeds([...selectedNeeds, need]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please sign in to submit a citizen hazard report.");
      return;
    }

    setSubmitting(true);
    try {
      let coords = [77.209, 28.6139];
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
          );
          coords = [pos.coords.longitude, pos.coords.latitude];
        } catch {
          // Use default
        }
      }

      const res = await incidentsApi.report({
        title,
        description,
        crisisTypeId: crisisTypeId || null,
        severity,
        location: {
          type: "Point",
          coordinates: coords,
        },
        reportedNeeds: selectedNeeds,
        affectedPeopleCount: Number(affectedCount),
      });

      if (res?.data) {
        setIncidents([res.data, ...incidents]);
        setShowForm(false);
        setTitle("");
        setDescription("");
        setSelectedNeeds([]);
      }
    } catch (err) {
      alert("Failed to report incident: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-white">Citizen & Sensor Incident Reports</h2>
            <span className="text-xs bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-bold">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time hazard mapping extracted from citizen reports and IoT feeds to identify trapped areas and supply shortages.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-1.5 shrink-0"
        >
          <span>{showForm ? "✕ Close Form" : "➕ Report New Hazard"}</span>
        </button>
      </div>

      {/* Report Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-slate-900 rounded-2xl border border-slate-700 space-y-4 shadow-xl"
        >
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Submit Incident / Hazard Report
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Incident Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flash flood road blockage near Sector 4"
                className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Ongoing Crisis Type
              </label>
              <select
                value={crisisTypeId}
                onChange={(e) => setCrisisTypeId(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="">General Hazard</option>
                {crises.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Description & Specific Location Landmark *
            </label>
            <textarea
              rows="3"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe road blockage, water level, power line hazard, or trapped survivors..."
              className="w-full bg-slate-950 text-slate-100 text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="low">Low (Minor Delay)</option>
                <option value="medium">Medium (Moderate Hazard)</option>
                <option value="high">High (Severe Danger)</option>
                <option value="critical">Critical (Immediate Rescue Needed)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Estimated Affected People
              </label>
              <input
                type="number"
                min="0"
                value={affectedCount}
                onChange={(e) => setAffectedCount(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Urgent Relief Needs:
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_NEEDS.map((need) => {
                const isSelected = selectedNeeds.includes(need);
                return (
                  <button
                    type="button"
                    key={need}
                    onClick={() => toggleNeed(need)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      isSelected
                        ? "bg-blue-600 border-blue-500 text-white font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {need}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Publish Report"}
            </button>
          </div>
        </form>
      )}

      {/* Incidents Feed */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">
          Community Incident Reports ({incidents.length})
        </div>

        {incidents.length === 0 && !loading && (
          <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
            No incidents reported yet. Community area is currently clear.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {incidents.map((item) => (
            <div
              key={item._id}
              className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-750 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-white">{item.title}</h4>
                  <span className="text-[11px] text-slate-400">
                    Reported by {item.userId?.name || "Citizen"} •{" "}
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    item.severity === "critical"
                      ? "bg-red-950 text-red-400 border border-red-800"
                      : item.severity === "high"
                      ? "bg-amber-950 text-amber-400 border border-amber-800"
                      : "bg-blue-950 text-blue-400 border border-blue-800"
                  }`}
                >
                  {item.severity}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

              {item.reportedNeeds?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                  {item.reportedNeeds.map((need, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded border border-slate-800"
                    >
                      ⚠️ Needs {need}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Affected: <b>{item.affectedPeopleCount || 1}</b> people</span>
                <span className="font-bold uppercase text-emerald-400">
                  ● Status: {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

