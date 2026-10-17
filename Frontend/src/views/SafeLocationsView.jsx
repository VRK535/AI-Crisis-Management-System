import React, { useState, useEffect } from "react";
import MapView from "../components/MapView.jsx";
import { safeLocationsApi, crisisApi } from "../api/index.js";
import { useOffline } from "../context/OfflineContext.jsx";

const SHELTER_TYPES = [
  { value: "", label: "All Shelters" },
  { value: "flood_shelter", label: "Elevated Flood Shelters (Floods)" },
  { value: "earthquake_assembly", label: "Open Assembly Grounds (Earthquake)" },
  { value: "hospital", label: "Emergency Hospitals" },
  { value: "isolation_center", label: "Isolation Centers (Pandemic)" },
  { value: "cyclone_shelter", label: "Reinforced Cyclone Shelters" },
];

export default function SafeLocationsView() {
  const { isOnline, offlineSafeZones, downloadSafeZonesForOffline } = useOffline();

  // User coordinates: default to New Delhi [77.2090, 28.6139] or user GPS
  const [coords, setCoords] = useState([77.2090, 28.6139]);
  const [locating, setLocating] = useState(false);
  const [crises, setCrises] = useState([]);
  const [selectedCrisis, setSelectedCrisis] = useState("");
  const [shelterType, setShelterType] = useState("");
  const [wheelchair, setWheelchair] = useState(false);

  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [offlineDownloading, setOfflineDownloading] = useState(false);
  const [offlineSuccess, setOfflineSuccess] = useState("");

  // Detect GPS Location on load
  useEffect(() => {
    detectLocation();
    loadCrises();
  }, []);

  const detectLocation = () => {
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords([pos.coords.longitude, pos.coords.latitude]);
          setLocating(false);
        },
        () => {
          setLocating(false);
        },
        { timeout: 8000 }
      );
    }
  };

  const loadCrises = async () => {
    try {
      const res = await crisisApi.getCrises();
      if (res?.data) setCrises(res.data);
    } catch {
      // Fallback
    }
  };

  // Fetch nearby shelters
  useEffect(() => {
    async function fetchShelters() {
      if (!isOnline) {
        // Use offline cache
        setShelters(offlineSafeZones || []);
        return;
      }

      setLoading(true);
      try {
        const res = await safeLocationsApi.getNearby({
          longitude: coords[0],
          latitude: coords[1],
          crisisTypeId: selectedCrisis,
          shelterType,
          wheelchairAccessible: wheelchair,
        });

        if (res?.data) {
          setShelters(res.data);
          if (res.data.length > 0) setSelectedShelter(res.data[0]);
        }
      } catch (err) {
        console.warn("Failed to fetch shelters:", err.message);
        // Fallback to offline cache if network call fails
        if (offlineSafeZones.length > 0) {
          setShelters(offlineSafeZones);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchShelters();
  }, [coords, selectedCrisis, shelterType, wheelchair, isOnline]);

  const handleDownloadOffline = async () => {
    setOfflineDownloading(true);
    setOfflineSuccess("");
    try {
      const data = await downloadSafeZonesForOffline();
      setOfflineSuccess(`Downloaded ${data?.total || 0} shelters to offline storage!`);
      setTimeout(() => setOfflineSuccess(""), 4000);
    } catch (err) {
      alert("Failed to download offline cache: " + err.message);
    } finally {
      setOfflineDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Offline Cache Action */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-white">Crisis-Based Safe Location Guidance</h2>
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
              Dynamic GPS
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Identifies nearest safe zones evaluated for elevation (floods), open grounds (earthquakes), capacity, and accessibility. Avoids danger zones with turn-by-turn directions.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={detectLocation}
            disabled={locating}
            className="text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-slate-200 flex items-center space-x-1.5 transition"
          >
            <span>{locating ? "📡 Locating..." : "📍 Recalculate GPS"}</span>
          </button>

          <button
            onClick={handleDownloadOffline}
            disabled={offlineDownloading}
            className="text-xs px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <span>{offlineDownloading ? "⏳ Caching..." : "💾 Save Offline Map"}</span>
          </button>
        </div>
      </div>

      {offlineSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <span>✅</span>
          <span>{offlineSuccess}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Crisis Type
          </label>
          <select
            value={selectedCrisis}
            onChange={(e) => setSelectedCrisis(e.target.value)}
            className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Ongoing Crises</option>
            {crises.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.severity?.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Shelter Classification
          </label>
          <select
            value={shelterType}
            onChange={(e) => setShelterType(e.target.value)}
            className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-blue-500"
          >
            {SHELTER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 cursor-pointer w-full hover:bg-slate-750">
            <input
              type="checkbox"
              checked={wheelchair}
              onChange={(e) => setWheelchair(e.target.checked)}
              className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-0"
            />
            <span className="font-medium">♿ Wheelchair / Ramp Accessible Only</span>
          </label>
        </div>
      </div>

      {/* Main Split: Map View & Shelter Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Interactive Map */}
        <div className="lg:col-span-7 h-[420px] lg:h-[580px]">
          <MapView
            userCoords={coords}
            shelters={shelters}
            onSelectShelter={(s) => setSelectedShelter(s)}
          />
        </div>

        {/* Right Side: Shelters Feed & Details */}
        <div className="lg:col-span-5 space-y-3 max-h-[580px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>RECOMMENDED SAFE LOCATIONS ({shelters.length})</span>
            {loading && <span className="animate-pulse text-blue-400">Scanning GPS radius...</span>}
          </div>

          {shelters.length === 0 && !loading && (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs space-y-2">
              <p className="text-3xl">🏕️</p>
              <p className="font-semibold text-slate-300">No safe shelters matched your filter criteria.</p>
              <p>Try switching shelter classification or clear active filters.</p>
            </div>
          )}

          {shelters.map((s) => {
            const isSelected = selectedShelter?._id === s._id;
            const isFloodSafe = (s.elevationMeters || 0) >= 15;
            const availableSlots =
              s.availableSlots !== undefined
                ? s.availableSlots
                : Math.max(0, (s.capacity || 0) - (s.currentOccupancy || 0));

            return (
              <div
                key={s._id}
                onClick={() => setSelectedShelter(s)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? "bg-slate-800/95 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-white">{s.name}</h3>
                    <p className="text-xs text-slate-400">
                      {s.address?.street ? `${s.address.street}, ` : ""}
                      {s.address?.city}, {s.address?.state}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                      s.status === "open"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-red-950 text-red-300 border border-red-800"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
                  <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                    <span className="block text-[10px] text-slate-400">Distance</span>
                    <span className="font-extrabold text-xs text-blue-400">
                      {s.distanceKm !== undefined ? `${s.distanceKm} km` : "Nearby"}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                    <span className="block text-[10px] text-slate-400">Elevation</span>
                    <span
                      className={`font-extrabold text-xs ${
                        isFloodSafe ? "text-emerald-400" : "text-slate-300"
                      }`}
                    >
                      ⛰️ {s.elevationMeters || 0}m
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                    <span className="block text-[10px] text-slate-400">Free Slots</span>
                    <span
                      className={`font-extrabold text-xs ${
                        availableSlots > 20
                          ? "text-emerald-400"
                          : availableSlots > 0
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {availableSlots} / {s.capacity}
                    </span>
                  </div>
                </div>

                {/* Facilities Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {s.facilities?.wheelchairAccessible && (
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      ♿ Wheelchair
                    </span>
                  )}
                  {s.facilities?.hasMedicalSupport && (
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      🏥 Medical
                    </span>
                  )}
                  {s.facilities?.hasFoodSupplies && (
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      🍞 Food
                    </span>
                  )}
                  {s.facilities?.hasPowerBackup && (
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      ⚡ Power
                    </span>
                  )}
                  {s.facilities?.hasDrinkingWater && (
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      💧 Water
                    </span>
                  )}
                </div>

                {/* Evacuation Guidance Note */}
                {s.evacuationNotes && (
                  <div className="mt-3 p-2 bg-blue-950/30 border border-blue-900/50 rounded-lg text-[11px] text-blue-200">
                    <span className="font-bold">🧭 Evacuation Route: </span>
                    {s.evacuationNotes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

