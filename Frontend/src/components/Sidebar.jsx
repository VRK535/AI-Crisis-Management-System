import React from "react";

const NAV_ITEMS = [
  {
    id: "safe-locations",
    label: "Safe Shelters",
    subtitle: "Elevation & Hazard Guidance",
    icon: "📍",
    badge: "Core",
  },
  {
    id: "chatbot",
    label: "Personalized RAG",
    subtitle: "Medical & Health Guidance",
    icon: "🤖",
    badge: "AI",
  },
  {
    id: "p2p",
    label: "Offline P2P Chat",
    subtitle: "Bluetooth & Wi-Fi Mesh",
    icon: "📶",
    badge: "Offline",
  },
  {
    id: "sos",
    label: "Emergency SOS",
    subtitle: "AI Rescue Prioritization",
    icon: "🚨",
    badge: "Priority",
    highlight: true,
  },
  {
    id: "incidents",
    label: "Hazard Reports",
    subtitle: "Community & Sensor Feeds",
    icon: "📢",
  },
  {
    id: "dashboard",
    label: "Command Dashboard",
    subtitle: "Operational Picture",
    icon: "📊",
  },
  {
    id: "profile",
    label: "Medical & Family",
    subtitle: "Health Profile & Contacts",
    icon: "👤",
  },
];

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between p-3 shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Crisis Operations
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between group ${
                isActive
                  ? item.highlight
                    ? "bg-red-600/20 border border-red-500/40 text-red-200"
                    : "bg-blue-600/20 border border-blue-500/40 text-blue-100"
                  : "hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent"
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <span className="text-xl shrink-0 group-hover:scale-110 transition transform">
                  {item.icon}
                </span>
                <div className="truncate">
                  <div className="font-semibold text-sm leading-tight truncate">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                    item.highlight
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Safety Notice Footer */}
      <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1 hidden md:block">
        <div className="flex items-center space-x-1.5 font-bold text-amber-400">
          <span>⚠️</span>
          <span>In Life-Threatening Danger?</span>
        </div>
        <p>Trigger instant SOS or call national emergency services immediately.</p>
      </div>
    </aside>
  );
}

