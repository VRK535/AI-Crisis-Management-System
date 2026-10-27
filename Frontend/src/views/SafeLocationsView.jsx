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

const riskPriority = { low: 0, moderate: 1, medium: 1, high: 2, critical: 3 };

const getAvailableSlots = (shelter) =>
  shelter.availableSlots !== undefined
    ? shelter.availableSlots
    : Math.max(0, (shelter.capacity || 0) - (shelter.currentOccupancy || 0));

export default function SafeLocationsView() {
  const { isOnline, offlineSafeZones, saveSafeZonesOffline } = useOffline();

  // User coordinates: default to New Delhi [77.2090, 28.6139] or user GPS
  const [coords, setCoords] = useState([77.2090, 28.6139]);
  const [recenterKey, setRecenterKey] = useState(0);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [crises, setCrises] = useState([]);
  const [selectedCrisis, setSelectedCrisis] = useState("");
  const [shelterType, setShelterType] = useState("");
  const [wheelchair, setWheelchair] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offlineCacheError, setOfflineCacheError] = useState("");
  const recommendedShelters = [...shelters].sort((a, b) => {
    const statusRank = (shelter) => (shelter.status === "open" ? 0 : shelter.status === "full" ? 2 : 1);
    const riskRank = (shelter) => riskPriority[shelter.riskLevel?.toLowerCase()] ?? 4;

    return (
      statusRank(a) - statusRank(b) ||
      riskRank(a) - riskRank(b) ||
      getAvailableSlots(b) - getAvailableSlots(a) ||
      (b.elevationMeters || 0) - (a.elevationMeters || 0) ||
      (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY)
    );
  });

  // Detect GPS Location on load
  useEffect(() => {
    detectLocation();
    loadCrises();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location is unavailable. Use a supported browser over HTTPS or localhost.");
      return;
    }

    setLocating(true);
    setLocationError("");
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            setLocationError("Your device returned invalid location coordinates.");
            setLocating(false);
            return;
          }

          setCoords([longitude, latitude]);
          setRecenterKey((key) => key + 1);
          setLocating(false);
        },
        (error) => {
          const message =
            error.code === error.PERMISSION_DENIED
              ? "Location permission is blocked. Allow location access in your browser settings."
              : error.code === error.POSITION_UNAVAILABLE
              ? "Your device could not determine your location. Check GPS or location services."
              : error.code === error.TIMEOUT
              ? "Location request timed out. Please try again."
              : "Unable to retrieve your location.";
          setLocationError(message);
          setLocating(false);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
    } catch (error) {
      setLocationError(error.message || "Unable to start the location request.");
      setLocating(false);
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

        if (Array.isArray(res?.data)) {
          setShelters(res.data);
          try {
            saveSafeZonesOffline(res.data, {
              longitude: coords[0],
              latitude: coords[1],
              savedAt: new Date().toISOString(),
            });
            setOfflineCacheError("");
          } catch (error) {
            console.warn("Could not save shelters for offline use:", error.message);
            setOfflineCacheError("Offline cache could not be updated.");
          }
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

  return (
    <div className="h-full overflow-y-auto p-2 sm:p-3">
      <div className="flex flex-col gap-4">
        <div className="h-[calc(100dvh-7rem)] min-h-[360px] max-h-[900px]">
          <MapView
            userCoords={coords}
            recenterKey={recenterKey}
            shelters={shelters}
            controls={
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => setFiltersOpen((open) => !open)}
                  aria-label={filtersOpen ? "Close map filters" : "Open map filters"}
                  aria-expanded={filtersOpen}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    {filtersOpen ? (
                      <path d="M18 6 6 18M6 6l12 12" />
                    ) : (
                      <>
                        <path d="M4 7h9m4 0h3M4 17h3m4 0h9" />
                        <circle cx="15" cy="7" r="2" />
                        <circle cx="9" cy="17" r="2" />
                      </>
                    )}
                  </svg>
                </button>

                {filtersOpen && (
                  <div className="w-72 max-w-[calc(100vw-5rem)] space-y-3 rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-xl">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Crisis Type
                      <select
                        value={selectedCrisis}
                        onChange={(e) => setSelectedCrisis(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs normal-case text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Ongoing Crises</option>
                        {crises.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} ({c.severity?.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Shelter Classification
                      <select
                        value={shelterType}
                        onChange={(e) => setShelterType(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs normal-case text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {SHELTER_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={wheelchair}
                        onChange={(e) => setWheelchair(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Wheelchair accessible</span>
                    </label>
                  </div>
                )}
              </div>
            }
            mapActions={
              <>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locating}
                  aria-label={locating ? "Finding your location" : "Recenter map on your location"}
                  title={locating ? "Finding your location" : "Recenter on your location"}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 ${locating ? "animate-pulse" : ""}`}>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8L17 7m-10 10-1.4 1.4" />
                  </svg>
                </button>
                {locationError && (
                  <div role="status" className="max-w-56 rounded-lg bg-white px-3 py-2 text-xs text-red-700 shadow-lg">
                    {locationError}
                  </div>
                )}
                {offlineCacheError && (
                  <div role="status" className="max-w-56 rounded-lg bg-white px-3 py-2 text-xs text-amber-700 shadow-lg">
                    {offlineCacheError}
                  </div>
                )}
                {loading && (
                  <div role="status" className="rounded-full bg-white px-3 py-2 text-xs text-slate-600 shadow-lg">
                    Updating shelters...
                  </div>
                )}
              </>
            }
          />
        </div>

        <section aria-labelledby="safe-shelters-heading" className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 id="safe-shelters-heading" className="text-sm font-bold text-white">
                Safest nearby locations
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Open locations with lower risk are shown first.
              </p>
            </div>
            <span className="shrink-0 text-xs text-slate-400">
              {loading ? "Updating..." : `${recommendedShelters.length} locations`}
            </span>
          </div>

          <div className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">
            {recommendedShelters.length === 0 ? (
              <p className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-center text-xs text-slate-400">
                {loading ? "Finding nearby safe locations..." : "No nearby locations match these filters."}
              </p>
            ) : (
              recommendedShelters.map((shelter, index) => {
                const availableSlots = getAvailableSlots(shelter);

                return (
                  <article
                    key={shelter._id || `${shelter.name}-${index}`}
                    className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-white">
                          <span className="mr-2 text-emerald-400">{index + 1}.</span>
                          {shelter.name || "Safe location"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {[shelter.address?.street, shelter.address?.city, shelter.address?.state]
                            .filter(Boolean)
                            .join(", ") || "Address unavailable"}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                        shelter.status === "open"
                          ? "bg-emerald-950 text-emerald-300"
                          : shelter.status === "full"
                          ? "bg-red-950 text-red-300"
                          : "bg-amber-950 text-amber-300"
                      }`}>
                        {shelter.status || "Status unknown"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-300">
                      <span>Risk: {shelter.riskLevel || "Unknown"}</span>
                      <span>Free slots: {availableSlots}</span>
                      <span>Elevation: {shelter.elevationMeters || 0} m</span>
                      {shelter.distanceKm !== undefined && <span>Distance: {shelter.distanceKm} km</span>}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
