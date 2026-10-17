import React, { useState, useRef, useEffect } from "react";
import { chatbotApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";

const SAMPLE_QUERIES = [
  "Water is entering our ground floor. Where should I evacuate?",
  "I have asthma and dust/smoke is spreading. What should I pack?",
  "How should I evacuate my 70-year-old grandmother with mobility issues?",
  "Earthquake shaking just stopped. What immediate steps to take?",
];

export default function ChatbotView() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your **AI-CMS Personalized Crisis Assistant**.\n\nI combine verified disaster management protocols (NDMA, WHO, Red Cross) with your **personal medical history**, **age group**, and **family details** to provide safe, situation-specific guidance.\n\nHow can I help you right now?",
      sources: ["NDMA", "WHO Emergency Protocols"],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryToSend = inputQuery) => {
    const text = queryToSend.trim();
    if (!text || loading) return;

    const userMsg = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      // Get GPS if available
      let currentLocation = null;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
          );
          currentLocation = { coordinates: [pos.coords.longitude, pos.coords.latitude] };
        } catch {
          // Ignore location errors
        }
      }

      const res = await chatbotApi.ask({
        query: text,
        currentLocation,
        conversationHistory: messages.slice(-4),
      });

      if (res?.data) {
        const botMsg = {
          role: "assistant",
          content: res.data.answer,
          sources: res.data.groundedSources || ["NDMA Verified Standards"],
          recommendedShelter: res.data.recommendedShelter,
          personalizedFactors: res.data.personalizedFactors,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Unable to retrieve guidance**: ${err.message}. If this is an active emergency, please dial 112 or trigger the SOS button immediately.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[740px] max-h-[85vh] bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center space-x-2">
              <span>Personalized RAG Disaster Chatbot</span>
              <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold">
                Grounded Knowledge
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Retrieval-Augmented Guidance customized for your age, medications, and family.
            </p>
          </div>
        </div>

        {/* User Personalization Context Badge */}
        {isAuthenticated && user && (
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-2 self-start sm:self-auto">
            <span>🩺 Profile Active:</span>
            <span className="font-bold text-blue-400">
              {user.age ? `${user.age} yrs` : "Adult"}
              {user.medicalConditions?.length > 0 ? ` • ${user.medicalConditions.join(", ")}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Suggested Quick Queries */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs shrink-0">
        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Suggested:</span>
        {SAMPLE_QUERIES.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition text-xs"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  isUser ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                }`}
              >
                {isUser ? "👤" : "🤖"}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? "bg-red-600 text-white rounded-tr-none"
                    : "bg-slate-850 border border-slate-750 text-slate-200 rounded-tl-none space-y-2.5"
                }`}
              >
                {/* Message Body */}
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Recommended Shelter Card inside response */}
                {m.recommendedShelter && (
                  <div className="mt-2.5 p-2.5 bg-blue-950/50 border border-blue-800/60 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-blue-300">
                        📍 Recommended Safe Zone: {m.recommendedShelter.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Distance: {m.recommendedShelter.distanceKm} km away
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-blue-600 text-white rounded-lg">
                      Open
                    </span>
                  </div>
                )}

                {/* Grounded Citations Footer */}
                {!isUser && m.sources && m.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <span>🛡️ Sources:</span>
                      <span className="font-semibold text-slate-300">{m.sources.join(", ")}</span>
                    </span>
                    <span>{m.timestamp}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">
              🤖
            </div>
            <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none text-xs text-blue-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>Retrieving emergency protocols and tailoring personal guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask anything: symptoms, evacuation path, packing inhalers, elderly care..."
          className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 transition"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-md shadow-blue-600/20 disabled:text-slate-500 disabled:shadow-none shrink-0"
        >
          Send Advice
        </button>
      </form>
    </div>
  );
}

