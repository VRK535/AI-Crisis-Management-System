import React, { useState } from "react";
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Workspace: Sidebar + Feature View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        <main className="flex-1 p-3 sm:p-5 overflow-y-auto bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {activeTab === "safe-locations" && <SafeLocationsView />}
            {activeTab === "chatbot" && <ChatbotView />}
            {activeTab === "p2p" && <OfflineP2PChatView />}
            {activeTab === "sos" && <SOSView />}
            {activeTab === "incidents" && <IncidentsView />}
            {activeTab === "dashboard" && <DashboardView />}
            {activeTab === "profile" && <ProfileView />}
          </div>
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

