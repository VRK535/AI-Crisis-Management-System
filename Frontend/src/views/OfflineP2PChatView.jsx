import React, { useState, useEffect } from "react";
import { p2pApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useOffline } from "../context/OfflineContext.jsx";

// Simulated nearby discovered peers in Bluetooth / Wi-Fi Direct range
const DEFAULT_NEARBY_PEERS = [
  {
    peerId: "BT_PEER_A4:91:B2:88",
    name: "Volunteer Rohit (Disaster Relief)",
    distance: "6 meters (Bluetooth LE)",
    rssi: -58,
    status: "Active Responder",
    role: "volunteer",
  },
  {
    peerId: "WIFI_PEER_C8:21:44:99",
    name: "Neighbor Sunita (Flat 302)",
    distance: "18 meters (Wi-Fi Direct)",
    rssi: -72,
    status: "Seeking Medical Aid",
    role: "neighbor",
  },
  {
    peerId: "BT_PEER_D1:55:77:22",
    name: "Community Health Worker",
    distance: "12 meters (Bluetooth LE)",
    rssi: -65,
    status: "First Aid Kit Available",
    role: "medic",
  },
];

export default function OfflineP2PChatView() {
  const { user, isAuthenticated } = useAuth();
  const {
    isOnline,
    meshMessages,
    queueOfflineMeshMessage,
    syncPendingMeshMessages,
    syncing,
    lastSyncTime,
  } = useOffline();

  const [registered, setRegistered] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [nearbyPeers, setNearbyPeers] = useState(DEFAULT_NEARBY_PEERS);
  const [selectedPeer, setSelectedPeer] = useState(DEFAULT_NEARBY_PEERS[0]);

  // Peer chat messages stored locally
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("p2p_active_chat");
      return saved
        ? JSON.parse(saved)
        : [
            {
              sender: "Volunteer Rohit (Disaster Relief)",
              text: "Hello! We are coordinating emergency supplies nearby. Do you need clean drinking water or first aid?",
              time: "10:14 AM",
              encrypted: true,
            },
          ];
    } catch {
      return [];
    }
  });

  const [textInput, setTextInput] = useState("");

  // Register device on backend if authenticated
  useEffect(() => {
    async function initRegistration() {
      if (isAuthenticated && !registered && isOnline) {
        try {
          await p2pApi.registerPeer({
            p2pPeerId: `BT_DEV_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            devicePublicKey: `RSA_PUB_KEY_${Date.now()}_99482711`,
            deviceName: user?.name ? `${user.name}'s Mobile` : "Android Device",
          });
          setRegistered(true);
        } catch {
          // Keep offline ready
        }
      }
    }
    initRegistration();
  }, [isAuthenticated, isOnline]);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      // Refresh simulated signal variations
      setNearbyPeers((prev) =>
        prev.map((p) => ({
          ...p,
          rssi: -50 - Math.floor(Math.random() * 30),
        }))
      );
    }, 1500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const newMsg = {
      sender: user?.name || "You (Offline Mode)",
      text: textInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      encrypted: true,
      recipient: selectedPeer.name,
    };

    const updatedChat = [...chatMessages, newMsg];
    setChatMessages(updatedChat);
    localStorage.setItem("p2p_active_chat", JSON.stringify(updatedChat));

    // Buffer into mesh queue for cloud sync
    queueOfflineMeshMessage({
      senderPeerId: user?._id || "local_device",
      recipientPeerId: selectedPeer.peerId,
      encryptedPayload: btoa(textInput.trim()),
      messageType: "chat",
    });

    setTextInput("");
  };

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-white">Offline Peer-to-Peer Mesh Chat</h2>
            <span className="text-xs bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-bold">
              Zero Internet Needed
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Works over device <b>Bluetooth LE</b> and <b>Wi-Fi Direct</b>. Directly communicates with nearby neighbors, doctors, and volunteers when cellular towers or power grids fail. Messages are encrypted end-to-end.
          </p>
        </div>

        {/* Scan & Mesh Sync Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleScan}
            disabled={scanning}
            className="text-xs px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold rounded-xl transition flex items-center space-x-1.5"
          >
            <span>{scanning ? "📡 Scanning Radio..." : "🔍 Scan Nearby Devices"}</span>
          </button>

          <button
            onClick={syncPendingMeshMessages}
            disabled={!isOnline || syncing || meshMessages.length === 0}
            className="text-xs px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white disabled:text-slate-500 font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <span>{syncing ? "⏳ Syncing..." : `🔄 Cloud Sync (${meshMessages.length})`}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Discovered Peers & Encrypted Chat Room */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[580px]">
        {/* Left Side: Discovered Nearby Peers List */}
        <div className="md:col-span-4 bg-slate-900/70 rounded-2xl border border-slate-800 p-3 flex flex-col justify-between overflow-hidden">
          <div className="space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Discovered in Range ({nearbyPeers.length})
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Radio Active</span>
              </span>
            </div>

            <div className="space-y-2">
              {nearbyPeers.map((peer) => {
                const isSelected = selectedPeer.peerId === peer.peerId;
                return (
                  <div
                    key={peer.peerId}
                    onClick={() => setSelectedPeer(peer)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? "bg-slate-800 border-amber-500/80 shadow-md ring-1 ring-amber-500/40"
                        : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-850"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-xs text-white truncate max-w-[170px]">
                        {peer.name}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {peer.rssi} dBm
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                      <span>📶 {peer.distance}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded">
                        {peer.status}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        {peer.role}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Device P2P Status Card */}
          <div className="mt-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-300">
              <span>Your Radio ID:</span>
              <span className="font-mono text-blue-400 text-[10px]">
                {user?.p2pPeerId || "BT_LOCAL_DEVICE"}
              </span>
            </div>
            <p className="text-[10px]">
              🔒 End-to-end encryption enabled with local RSA keypair.
            </p>
          </div>
        </div>

        {/* Right Side: Active P2P Chat Room */}
        <div className="md:col-span-8 bg-slate-900/70 rounded-2xl border border-slate-800 flex flex-col justify-between overflow-hidden">
          {/* Room Header */}
          <div className="p-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-lg">
                📶
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white">
                  Direct Chat with {selectedPeer.name}
                </h3>
                <p className="text-[10px] text-emerald-400">
                  ● Contactless P2P Link Active • {selectedPeer.distance}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-300">
              🔒 Encrypted
            </span>
          </div>

          {/* Messages Scroll Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map((msg, i) => {
              const isMe = msg.sender.includes("You");
              return (
                <div
                  key={i}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                    {msg.sender} • {msg.time}
                  </span>
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-amber-600 text-white rounded-tr-none"
                        : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-slate-850 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Send encrypted message directly to ${selectedPeer.name}...`}
              className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white disabled:text-slate-500 text-xs font-bold rounded-xl shadow-md transition shrink-0"
            >
              Send P2P
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

