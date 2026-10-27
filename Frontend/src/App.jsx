import React, { useEffect, useState } from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import { OfflineProvider } from "./context/OfflineContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import SafeLocationsView from "./views/SafeLocationsView.jsx";
import ChatbotView from "./views/ChatbotView.jsx";
import OfflineP2PChatView from "./views/OfflineP2PChatView.jsx";
import SOSView from "./views/SOSView.jsx";
import IncidentsView from "./views/IncidentsView.jsx";
import DashboardView from "./views/DashboardView.jsx";
import ProfileView from "./views/ProfileView.jsx";
import AuthModal from "./views/AuthModal.jsx";

function MainContent() {
  const [activeTab, setActiveTab] = useState("safe-locations");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.matchMedia("(min-width: 768px)").matches
  );

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const syncSidebarWithViewport = (event) => setIsSidebarOpen(event.matches);

    desktopQuery.addEventListener("change", syncSidebarWithViewport);
    return () => desktopQuery.removeEventListener("change", syncSidebarWithViewport);
  }, []);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onSelectTab={handleSelectTab}
      />

      {/* Main Workspace: Sidebar + Feature View */}
      <div className="relative flex-1 min-h-0 flex overflow-hidden">
        {isSidebarOpen ? (
          <>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-x-0 top-16 bottom-0 z-40 bg-slate-950/70 md:hidden"
            />
            <Sidebar
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              onMinimize={() => setIsSidebarOpen(false)}
            />
          </>
        ) : (
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-3 top-[4.75rem] z-30 rounded-lg border border-slate-700 bg-slate-900/95 p-2.5 text-slate-200 shadow-lg transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span aria-hidden="true">☰</span>
          </button>
        )}

        <main
          className={`min-w-0 flex-1 bg-slate-950 ${
            activeTab === "safe-locations"
              ? "min-h-0 overflow-hidden"
              : "overflow-y-auto p-3 sm:p-5"
          }`}
        >
          {activeTab === "safe-locations" ? (
            <SafeLocationsView />
          ) : (
            <div className="max-w-7xl mx-auto">
              {activeTab === "chatbot" && <ChatbotView />}
              {activeTab === "p2p" && <OfflineP2PChatView />}
              {activeTab === "sos" && <SOSView />}
              {activeTab === "incidents" && <IncidentsView />}
              {activeTab === "dashboard" && <DashboardView />}
              {activeTab === "profile" && <ProfileView />}
            </div>
          )}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <MainContent />
      </OfflineProvider>
    </AuthProvider>
  );
}
