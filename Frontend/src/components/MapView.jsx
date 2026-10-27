import React, { useEffect, useRef } from "react";

export default function MapView({
  userCoords,
  recenterKey = 0,
  shelters = [],
  onSelectShelter,
  controls,
  mapActions,
}) {
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (typeof window.L === "undefined") {
      console.warn("Leaflet library not loaded");
      return;
    }

    const L = window.L;
    const initialCoords = userCoords || [77.2090, 28.6139];
    const map = L.map(mapRef.current).setView([initialCoords[1], initialCoords[0]], 13);
    leafletInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    let resizeFrame = requestAnimationFrame(() => map.invalidateSize());
    const mapResizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => map.invalidateSize());
    });
    mapResizeObserver.observe(mapRef.current);

    return () => {
      mapResizeObserver.disconnect();
      cancelAnimationFrame(resizeFrame);
      map.remove();
      leafletInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!leafletInstance.current || !userCoords || userCoords.length !== 2) return;
    leafletInstance.current.flyTo([userCoords[1], userCoords[0]], 15, {
      animate: true,
      duration: 0.8,
    });
  }, [userCoords, recenterKey]);

  useEffect(() => {
    const map = leafletInstance.current;
    if (!map || typeof window.L === "undefined") return;
    const L = window.L;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add User Current Location Marker
    if (userCoords && userCoords.length === 2) {
      const userMarker = L.circleMarker([userCoords[1], userCoords[0]], {
        radius: 9,
        fillColor: "#3B82F6",
        color: "#FFFFFF",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
      })
        .addTo(map)
        .bindPopup("<b>📍 Your Current GPS Location</b>");

      markersRef.current.push(userMarker);
    }

    // Add Shelters Markers
    shelters.forEach((shelter) => {
      const coords = shelter.location?.coordinates;
      if (!coords || coords.length !== 2) return;

      const [lng, lat] = coords;
      const isElevated = (shelter.elevationMeters || 0) > 10;
      const color =
        shelter.status === "full"
          ? "#DC2626"
          : shelter.riskLevel === "low"
          ? "#10B981"
          : "#F59E0B";

      const marker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: color,
        color: "#FFFFFF",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(map);

      const popupContent = `
        <div style="color: #0f172a; min-width: 180px; font-family: sans-serif;">
          <h4 style="font-weight: bold; margin: 0 0 4px 0; font-size: 13px;">${shelter.name}</h4>
          <div style="font-size: 11px; margin-bottom: 4px;">
            <span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
              ${(shelter.type || "Shelter").replace("_", " ").toUpperCase()}
            </span>
          </div>
          <p style="margin: 3px 0; font-size: 11px;">
            <b>Capacity:</b> ${shelter.currentOccupancy || 0} / ${shelter.capacity || 0}
            <span style="color: ${color}; font-weight: bold;">(${shelter.availableSlots || Math.max(0, (shelter.capacity || 0) - (shelter.currentOccupancy || 0))} slots)</span>
          </p>
          ${isElevated ? `<p style="margin: 3px 0; font-size: 11px; color: #2563eb;"><b>⛰️ Elevation:</b> ${shelter.elevationMeters}m (Safe from Floods)</p>` : ""}
          ${shelter.distanceKm ? `<p style="margin: 3px 0; font-size: 11px;"><b>Distance:</b> ${shelter.distanceKm} km</p>` : ""}
          <p style="margin: 3px 0; font-size: 10px; color: #475569;">${shelter.evacuationNotes || "Follow main roads."}</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on("click", () => {
        if (onSelectShelter) onSelectShelter(shelter);
      });

      markersRef.current.push(marker);
    });
  }, [userCoords, shelters, onSelectShelter]);

  return (
    <div className="relative w-full h-full min-h-0 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
      <div ref={mapRef} className="absolute inset-0" />
      {controls && (
        <div className="absolute top-3 right-3 z-[400] pointer-events-none">
          <div className="pointer-events-auto">
            {controls}
          </div>
        </div>
      )}
      {mapActions && (
        <div className="absolute right-4 bottom-8 z-[400] flex flex-col gap-2">
          {mapActions}
        </div>
      )}
    </div>
  );
}
