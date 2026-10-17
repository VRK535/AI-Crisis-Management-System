import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useOffline } from "../context/OfflineContext.jsx";

export default function Navbar({ onOpenAuth, onSelectTab }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { isOnline, meshMessages, syncing, syncPendingMeshMessages, lastSyncTime } = useOffline();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
      {/* Brand & Title */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab("safe-locations")}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-black text-xl shadow-lg shadow-red-500/20">
          🛡️
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg text-white tracking-tight">AI-CMS</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/60">
              Crisis Shield
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Safe Location Guidance • Personalized RAG • Offline P2P
          </p>
        </div>
      </div>

      {/* Network & P2P Mesh Status */}
      <div className="flex items-center space-x-3">
        <div
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isOnline
              ? "bg-emerald-950/70 border-emerald-800 text-emerald-400"
              : "bg-amber-950/70 border-amber-800 text-amber-300 animate-pulse"
          }`}
          title={isOnline ? "Connected to Internet Cloud" : "Offline mode: Local P2P Mesh Active"}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400" : "bg-amber-400"}`} />
          <span>{isOnline ? "Cloud Connected" : "Offline Mesh Mode"}</span>
        </div>

        {/* Buffered Mesh messages count indicator */}
        {meshMessages.length > 0 && (
          <button
            onClick={syncPendingMeshMessages}
            disabled={!isOnline || syncing}
            className="hidden md:flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-300 hover:bg-blue-900 transition disabled:opacity-50"
          >
            <span>🔄 {meshMessages.length} Buffered</span>
            {syncing && <span className="animate-spin text-[10px]">⏳</span>}
          </button>
        )}

        {/* SOS One-Touch Button */}
        <button
          onClick={() => onSelectTab("sos")}
          className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center space-x-1.5 active:scale-95 transition"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>SOS</span>
        </button>

        {/* User Profile or Login */}
        {isAuthenticated ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <button
              onClick={() => onSelectTab("profile")}
              className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition"
            >
              <span>👤</span>
              <span className="font-medium max-w-[100px] truncate">{user?.name || "User"}</span>
            </button>
            <button
              onClick={logout}
              className="text-xs text-slate-400 hover:text-red-400 px-2 py-1.5 rounded hover:bg-slate-800 transition"
              title="Logout"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
}

