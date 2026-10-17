import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Login inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register inputs
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [medicalConditions, setMedicalConditions] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        const conditionsArray = medicalConditions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          age: age ? Number(age) : null,
          bloodGroup,
          medicalConditions: conditionsArray,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg text-sm"
        >
          ✕
        </button>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              isLogin ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              !isLogin ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Create Citizen Account
          </button>
        </div>

        <div>
          <h3 className="text-lg font-black text-white">
            {isLogin ? "Welcome Back to AI-CMS" : "Join AI Crisis Shield"}
          </h3>
          <p className="text-xs text-slate-400">
            {isLogin
              ? "Access your saved family members and personalized evacuation routes."
              : "Register your medical identity for accurate RAG guidance and rescue triage."}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {!isLogin && (
            <div>
              <label className="text-slate-400 block font-bold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vivek Sharma"
                className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="text-slate-400 block font-bold mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vivek@example.com"
              className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="text-slate-400 block font-bold mb-1">10-Digit Mobile Number *</label>
              <input
                type="tel"
                required
                pattern="[6-9][0-9]{9}"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="text-slate-400 block font-bold mb-1">Password *</label>
            <input
              type="password"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block font-bold mb-1">Age</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="28"
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block font-bold mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block font-bold mb-1">
                  Medical Conditions (comma-separated)
                </label>
                <input
                  type="text"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Asthma, Diabetes, Heart Disease"
                  className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50 text-sm mt-2"
          >
            {loading ? "Processing..." : isLogin ? "Sign In to Account" : "Register Citizen Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

