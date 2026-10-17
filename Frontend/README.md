# 🛡️ AI-CMS Frontend Web & Mobile-Responsive Application

Frontend client for the **AI-Based Crisis Management System with Safe Location Guidance, Personalized RAG Chatbot, and Offline Peer-to-Peer Chat**.

---

## ⚡ Quick Start

### 1. Install & Start Backend First
In a terminal:
```powershell
cd "c:\Users\vivek\.vscode\Crisis Management\backend"
npm install
npm run seed     # (Optional: seeds sample shelters, crises, and NDMA protocols)
npm run dev      # Starts API on http://localhost:5000
```

### 2. Install & Start Frontend
In a separate terminal:
```powershell
cd "c:\Users\vivek\.vscode\Crisis Management\frontend"
npm install
npm run dev      # Starts Vite app on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 📱 Feature Walkthrough

### 1. 📍 Crisis-Based Safe Location Module
* **Interactive Map**: OpenStreetMap (via Leaflet) tracks real-time GPS position.
* **Smart Filter**: Select **Flood Shelters** (evaluates elevation in meters), **Open Assembly Grounds** (earthquakes), **Hospitals**, or **Isolation Centers**.
* **Accessibility**: Filter by wheelchair ramp accessibility, food/water supplies, and backup power.
* **Offline Map Cache**: Click **"Save Offline Map"** to cache shelters in `localStorage` for no-internet scenarios.

### 2. 🤖 Personalized RAG Chatbot
* Combines **NDMA/WHO official emergency protocols** with the user's **personal medical profile** (Asthma, Diabetes, Mobility limits, Age).
* Advises situation-specific actions (e.g. packing inhalers in waterproof bags, avoiding basements during floods, assisted senior evacuation).
* Points directly to the nearest recommended safe shelter with distance.
* Cites official verification sources (NDMA, WHO, Red Cross).

### 3. 📶 Offline Peer-to-Peer Chat (Bluetooth / Wi-Fi Direct Mesh)
* Works when cellular towers or internet grids are offline.
* Discovers nearby users (neighbors, community health workers, disaster volunteers) with RSSI signal strength.
* Direct end-to-end encrypted chat room with local storage.
* **Cloud Mesh Sync**: Buffers messages locally; click **"Cloud Sync"** to relay emergency messages once internet connection is restored.

### 4. 🚨 Emergency SOS & Automated Rescue Triage
* High-visibility pulsing SOS trigger button.
* Auto-calculates an **AI Triage Score (1–10)** based on age, medical vulnerabilities, and trapped family members.
* Real-time status tracker (`PENDING`, `ACTIVE`, `ACKNOWLEDGED`, `RESOLVED`).

### 5. 📢 Citizen Hazard Reporting
* Community members report washed out bridges, toxic smoke, and live hazards.
* Tag urgent relief needs: Clean Water, Medical Aid, Evacuation Boat, Food Rations.

### 6. 📊 Unified Command Dashboard
* Real-time operational picture for authorities.
* Live shelter capacity vs current occupancy meter.
* Prioritized rescue dispatch queue ranked by AI triage score.

