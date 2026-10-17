import React, { useState, useEffect } from "react";
import { sosApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function SOSView() {
  const { user, isAuthenticated } = useAuth();

  const [coords, setCoords] = useState([77.2090, 28.6139]);
  const [locating, setLocating] = useState(false);
  const [medicalEmergency, setMedicalEmergency] = useState(false);
  const [peopleCount, setPeopleCount] = useState(1);
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [activeSOS, setActiveSOS] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    detectLocation();
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const detectLocation = () => {
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords([pos.coords.longitude, pos.coords.latitude]);
          setLocating(false);
        },
        () => setLocating(false),
        { timeout: 5000 }
      );
    }
  };

  const loadHistory = async () => {
    try {
      const res = await sosApi.getHistory();
      if (res?.data) {
        setHistory(res.data);
        const openSOS = res.data.find(
          (s) => s.status === "pending" || s.status === "active" || s.status === "acknowledged"
        );
        if (openSOS) setActiveSOS(openSOS);
      }
    } catch {
      // Ignore
    }
  };

  const handleTriggerSOS = async () => {
    if (!isAuthenticated) {
      alert("Please sign in or register first so emergency responders receive your medical identity!");
      return;
    }

    setSending(true);
    try {
      const res = await sosApi.trigger({
        location: {
          type: "Point",
          coordinates: coords,
        },
        message: message.trim(),
        medicalEmergency,
        peopleCount: Number(peopleCount),
      });

      if (res?.data) {
        setActiveSOS(res.data);
        setHistory((prev) => [res.data, ...prev]);
        setMessage("");
      }
    } catch (err) {
      alert("Failed to trigger SOS: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleCancelSOS = async () => {
    if (!activeSOS?._id) return;
    if (!confirm("Are you sure you want to cancel this emergency SOS?")) return;

    try {
      await sosApi.cancel(activeSOS._id);
      setActiveSOS(null);
      loadHistory();
    } catch (err) {
      alert("Could not cancel SOS: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Active Alert Banner if SOS is active */}
      {activeSOS ? (
        <div className="p-6 bg-red-950/80 border-2 border-red-600 rounded-2xl shadow-2xl space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                🚨 SOS Signal Active & Dispatched
              </h2>
            </div>
            <span className="text-xs font-bold uppercase px-3 py-1 bg-red-600 text-white rounded-lg">
              Status: {activeSOS.status}
            </span>
          </div>

          <p className="text-xs text-red-200">
            Emergency response command and nearby registered volunteers have received your coordinates. Stay in place or move to higher ground if safe.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 p-3 rounded-xl text-center text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">AI Triage Priority</span>
              <span className="font-black text-lg text-amber-400">
                {activeSOS.priorityScore || 8} / 10
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">People Count</span>
              <span className="font-bold text-white text-base">{activeSOS.peopleCount || 1}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Medical Emergency</span>
              <span className="font-bold text-red-400 text-base">
                {activeSOS.medicalEmergency ? "YES" : "NO"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">GPS Coordinates</span>
              <span className="font-mono text-slate-300 text-xs">
                {coords[1].toFixed(3)}, {coords[0].toFixed(3)}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleCancelSOS}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              Cancel SOS (I am Safe Now)
            </button>
          </div>
        </div>
      ) : (
        /* SOS Trigger Screen */
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-6 shadow-2xl">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-950 text-red-400 border border-red-800 uppercase tracking-widest">
              Instant Life-Safety Dispatch
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Trigger Emergency SOS
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
              Transmits your exact GPS position, personal health profile, and family vulnerability info to the automated rescue triage system.
            </p>
          </div>

          {/* Big Pulse SOS Button */}
          <div className="py-4">
            <button
              onClick={handleTriggerSOS}
              disabled={sending}
              className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-black text-2xl sm:text-3xl shadow-2xl shadow-red-600/50 flex flex-col items-center justify-center mx-auto active:scale-95 transition-all animate-sos-pulse"
            >
              <span>{sending ? "⏳" : "🚨"}</span>
              <span className="tracking-widest mt-1">SOS</span>
              <span className="text-[10px] font-medium tracking-normal text-red-200 uppercase mt-0.5">
                {sending ? "Transmitting..." : "Press to Alert"}
              </span>
            </button>
          </div>

          {/* Quick Urgency Modifiers */}
          <div className="max-w-md mx-auto grid grid-cols-2 gap-3 text-left">
            <label className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-slate-850">
              <input
                type="checkbox"
                checked={medicalEmergency}
                onChange={(e) => setMedicalEmergency(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold text-white block">Medical Emergency</span>
                <span className="text-[10px] text-slate-400">Injury, breathing, heart issue</span>
              </div>
            </label>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-xs font-bold text-white block">Trapped People</span>
              <input
                type="number"
                min="1"
                max="50"
                value={peopleCount}
                onChange={(e) => setPeopleCount(e.target.value)}
                className="w-full mt-1 bg-slate-950 text-white text-xs px-2 py-1 rounded border border-slate-800 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="max-w-md mx-auto text-left">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Optional Message / Danger Details
            </label>
            <textarea
              rows="2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Water reached 4 ft, grandmother cannot walk, need boat..."
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="text-[11px] text-slate-500">
            GPS Locked: <span className="font-mono text-slate-400">{coords[1].toFixed(4)}, {coords[0].toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* SOS History */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Your Emergency Dispatch History
          </h3>
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item._id}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white">
                    SOS Alert ({item.peopleCount} {item.peopleCount > 1 ? "people" : "person"})
                  </span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(item.createdAt).toLocaleString()} • Priority Score: {item.priorityScore}/10
                  </div>
                  {item.message && <p className="text-[11px] text-slate-300 mt-1 italic">"{item.message}"</p>}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    item.status === "resolved"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : item.status === "cancelled"
                      ? "bg-slate-800 text-slate-400"
                      : "bg-red-950 text-red-400 border border-red-800"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

