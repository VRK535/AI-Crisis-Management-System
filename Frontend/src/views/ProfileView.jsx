import React, { useState, useEffect } from "react";
import { familyApi, crisisApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";

const COMMON_CONDITIONS = [
  "Asthma",
  "Diabetes",
  "Cardiac Disease",
  "Mobility Impairment",
  "Hypertension",
  "COPD / Breathing",
  "Severe Allergies",
  "Dialysis Patient",
];

export default function ProfileView() {
  const { user, isAuthenticated, updateUserProfile } = useAuth();

  // Profile Form States
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age || "");
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || "O+");
  const [conditions, setConditions] = useState(user?.medicalConditions || []);
  const [specialNeeds, setSpecialNeeds] = useState(user?.specialNeeds || "");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Family Members
  const [family, setFamily] = useState([]);
  const [famName, setFamName] = useState("");
  const [famRelation, setFamRelation] = useState("parent");
  const [famAge, setFamAge] = useState("");
  const [famBlood, setFamBlood] = useState("O+");
  const [famPhone, setFamPhone] = useState("");
  const [famSubmitting, setFamSubmitting] = useState(false);

  // Emergency Contacts
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAge(user.age || "");
      setBloodGroup(user.bloodGroup || "O+");
      setConditions(user.medicalConditions || []);
      setSpecialNeeds(user.specialNeeds || "");
    }
    if (isAuthenticated) {
      loadFamily();
      loadEmergencyContacts();
    }
  }, [user, isAuthenticated]);

  const loadFamily = async () => {
    try {
      const res = await familyApi.getAll();
      if (res?.data) setFamily(res.data);
    } catch {
      // Ignore
    }
  };

  const loadEmergencyContacts = async () => {
    try {
      const res = await crisisApi.getEmergencyContacts();
      if (res?.data) setContacts(res.data);
    } catch {
      // Ignore
    }
  };

  const toggleCondition = (cond) => {
    if (conditions.includes(cond)) {
      setConditions(conditions.filter((c) => c !== cond));
    } else {
      setConditions([...conditions, cond]);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateUserProfile({
        name,
        age: age ? Number(age) : null,
        bloodGroup,
        medicalConditions: conditions,
        specialNeeds,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Profile update failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddFamily = async (e) => {
    e.preventDefault();
    if (!famName.trim() || !famAge) return;

    setFamSubmitting(true);
    try {
      const res = await familyApi.add({
        name: famName.trim(),
        relation: famRelation,
        age: Number(famAge),
        bloodGroup: famBlood,
        phone: famPhone.trim() || undefined,
      });
      if (res?.data) {
        setFamily([res.data, ...family]);
        setFamName("");
        setFamAge("");
        setFamPhone("");
      }
    } catch (err) {
      alert("Failed to add family member: " + err.message);
    } finally {
      setFamSubmitting(false);
    }
  };

  const handleDeleteFamily = async (id) => {
    try {
      await familyApi.delete(id);
      setFamily(family.filter((f) => f._id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-2xl border border-slate-700/80">
        <h2 className="text-xl font-black text-white">Personal Health & Family Safety Profile</h2>
        <p className="text-xs text-slate-300 mt-1">
          This data powers the <b>Personalized RAG Chatbot</b> and the <b>AI Rescue Prioritization</b> algorithm to make sure vulnerable family members receive emergency help first.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold">
          ✓ Profile updated! RAG Chatbot & Triage will now personalize to these conditions.
        </div>
      )}

      {/* User Health Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4 shadow-xl"
      >
        <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
          <span>🩺 Personal Medical Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Age</label>
            <input
              type="number"
              min="0"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 28"
              className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Medical Conditions Selector */}
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1.5">
            Active Medical Conditions (Used by RAG Chatbot to customize instructions):
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_CONDITIONS.map((cond) => {
              const active = conditions.includes(cond);
              return (
                <button
                  type="button"
                  key={cond}
                  onClick={() => toggleCondition(cond)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    active
                      ? "bg-red-600 border-red-500 text-white font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850"
                  }`}
                >
                  {active ? "✓ " : "+ "}
                  {cond}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">
            Special Needs / Mobility Notes (e.g. Ground floor access, Wheelchair, Dialysis)
          </label>
          <input
            type="text"
            value={specialNeeds}
            onChange={(e) => setSpecialNeeds(e.target.value)}
            placeholder="e.g. Uses walker, requires ramp access, daily insulin refrigeration..."
            className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Medical Profile"}
          </button>
        </div>
      </form>

      {/* Family Members Section */}
      <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
          <span>👨‍👩‍👧‍👦 Family Members Safety Tracker</span>
        </h3>

        {/* Add Family Form */}
        <form
          onSubmit={handleAddFamily}
          className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 space-y-3 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <input
              type="text"
              required
              placeholder="Member Name *"
              value={famName}
              onChange={(e) => setFamName(e.target.value)}
              className="bg-slate-900 text-slate-100 px-3 py-2 rounded-lg border border-slate-800"
            />
            <select
              value={famRelation}
              onChange={(e) => setFamRelation(e.target.value)}
              className="bg-slate-900 text-slate-100 px-3 py-2 rounded-lg border border-slate-800"
            >
              <option value="parent">Parent</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="sibling">Sibling</option>
              <option value="grandparent">Grandparent</option>
              <option value="other">Other</option>
            </select>
            <input
              type="number"
              min="0"
              max="120"
              required
              placeholder="Age *"
              value={famAge}
              onChange={(e) => setFamAge(e.target.value)}
              className="bg-slate-900 text-slate-100 px-3 py-2 rounded-lg border border-slate-800"
            />
            <select
              value={famBlood}
              onChange={(e) => setFamBlood(e.target.value)}
              className="bg-slate-900 text-slate-100 px-3 py-2 rounded-lg border border-slate-800"
            >
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                <option key={b} value={b}>
                  Blood: {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={famSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
            >
              {famSubmitting ? "Adding..." : "+ Add Family Member"}
            </button>
          </div>
        </form>

        {/* Family List */}
        <div className="space-y-2">
          {family.map((m) => (
            <div
              key={m._id}
              className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white text-sm">{m.name}</span>
                <span className="text-slate-400 ml-2 uppercase text-[10px] bg-slate-800 px-2 py-0.5 rounded">
                  {m.relation}
                </span>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Age: {m.age} yrs • Blood Group: <b className="text-red-400">{m.bloodGroup}</b>
                  {m.age >= 65 && <span className="ml-2 text-amber-400 font-bold">⚠️ Senior Citizen</span>}
                  {m.age <= 5 && <span className="ml-2 text-blue-400 font-bold">👶 Infant</span>}
                </div>
              </div>

              <button
                onClick={() => handleDeleteFamily(m._id)}
                className="text-xs text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-slate-800"
                title="Remove Member"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts Directory */}
      <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-extrabold text-white">
          📞 National Emergency Helplines (1-Click Dial)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
          <a
            href="tel:112"
            className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-blue-500 transition block"
          >
            <span className="text-xl block">🚨</span>
            <span className="font-bold text-white block mt-1">National Helpline</span>
            <span className="font-mono text-blue-400 text-sm font-extrabold">112</span>
          </a>
          <a
            href="tel:108"
            className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-red-500 transition block"
          >
            <span className="text-xl block">🚑</span>
            <span className="font-bold text-white block mt-1">Ambulance</span>
            <span className="font-mono text-red-400 text-sm font-extrabold">108</span>
          </a>
          <a
            href="tel:101"
            className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-amber-500 transition block"
          >
            <span className="text-xl block">🚒</span>
            <span className="font-bold text-white block mt-1">Fire Rescue</span>
            <span className="font-mono text-amber-400 text-sm font-extrabold">101</span>
          </a>
          <a
            href="tel:1078"
            className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-emerald-500 transition block"
          >
            <span className="text-xl block">🌪️</span>
            <span className="font-bold text-white block mt-1">Disaster NDMA</span>
            <span className="font-mono text-emerald-400 text-sm font-extrabold">1078</span>
          </a>
        </div>
      </div>
    </div>
  );
}

