import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ onOpenAuth, onSelectTab }) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="z-40 h-16 shrink-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between">
      <button
        type="button"
        onClick={() => onSelectTab("safe-locations")}
        aria-label="AI-CMS home"
        className="flex items-center gap-3 text-left"
      >
        <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-black text-xl shadow-lg shadow-red-500/20">
          🛡️
        </span>
        <span className="font-extrabold text-lg text-white tracking-tight">AI-CMS</span>
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onSelectTab("sos")}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center gap-2 active:scale-95 transition"
        >
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>SOS</span>
        </button>

        <button
          type="button"
          onClick={isAuthenticated ? logout : onOpenAuth}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          {isAuthenticated ? "Sign out" : "Login"}
        </button>
      </div>
    </header>
  );
}
