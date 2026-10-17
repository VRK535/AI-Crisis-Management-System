# 🌐 AI-CMS Backend API Documentation & Frontend Integration Guide

This backend powers the **AI-Based Crisis Management System (AI-CMS)** with Safe Location Guidance, Personalized RAG Chatbot, and Offline Peer-to-Peer Chat.

---

## 🚀 Quick Start for Frontend Developers

- **Base URL**: `http://localhost:5000/api/v1`
- **Health Check**: `GET http://localhost:5000/health`
- **Authentication**: JWT Bearer Token in headers:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
- **Standard Response Format**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Success message",
    "data": { ... }
  }
  ```

---

## 📌 Core Modules & Endpoints

### 1. 📍 Crisis-Based Safe Location Module

#### A. Get Nearby Safe Locations (GPS + Crisis Type)
* **Method**: `GET /api/v1/safe-locations/nearby`
* **Query Params**:
  * `longitude`: number (e.g. `77.2090`)
  * `latitude`: number (e.g. `28.6139`)
  * `crisisTypeId`: string (optional, e.g. ObjectId of Flood/Earthquake)
  * `shelterType`: string (optional, e.g. `flood_shelter`, `earthquake_assembly`, `hospital`, `isolation_center`)
  * `maxDistance`: number (optional meters, default `30000`)
  * `wheelchairAccessible`: boolean (optional)
* **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "670...",
        "name": "Central Elevated Community Shelter",
        "type": "flood_shelter",
        "elevationMeters": 42,
        "capacity": 500,
        "currentOccupancy": 120,
        "availableSlots": 380,
        "distanceKm": 1.45,
        "status": "open",
        "riskLevel": "low",
        "facilities": {
          "wheelchairAccessible": true,
          "hasMedicalSupport": true,
          "hasFoodSupplies": true,
          "hasPowerBackup": true,
          "hasDrinkingWater": true
        },
        "recommendationLevel": "HIGHLY_RECOMMENDED",
        "evacuationNotes": "Take High St bridge, avoid underpasses."
      }
    ]
  }
  ```

#### B. Download Safe Zones for Offline Map Storage
* **Method**: `GET /api/v1/safe-locations/offline-cache?city=Delhi`
* **Description**: Mobile app calls this while connected to store local shelters in SQLite / AsyncStorage for no-internet scenarios.

#### C. Live Shelter Occupancy Update (Admin / Responder)
* **Method**: `PATCH /api/v1/safe-locations/:locationId/occupancy`
* **Body**: `{ "currentOccupancy": 210 }`

---

### 2. 🤖 Personalized RAG-Based Chatbot

#### Ask Personalized Question
* **Method**: `POST /api/v1/chatbot/ask`
* **Auth**: Required (`Bearer <token>`)
* **Body**:
  ```json
  {
    "query": "Water is entering my ground floor. What should I do right now?",
    "crisisTypeId": "670...",
    "currentLocation": {
      "coordinates": [77.2090, 28.6139]
    }
  }
  ```
* **How it works**:
  1. The backend automatically injects the user's personal profile (age, medical conditions like Asthma/Cardiac, special needs) and family members (infants, elderly).
  2. Retrieves curated protocols from verified authorities (NDMA, WHO, Red Cross).
  3. Recommends the nearest elevated shelter and specific medical actions (e.g., packing inhalers in waterproof bags).
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "query": "Water is entering my ground floor...",
      "answer": "Hello John. Based on verified emergency protocols for Flood...\nPersonalized Profile Advisory:\n• Personal Health Notice: Asthma kit...\nImmediate Recommended Actions:\n1. Move to upper floors immediately...\n📍 Recommended Safe Shelter: Central Elevated Shelter (1.5 km away)...",
      "groundedSources": ["NDMA (National Disaster Management Authority)"],
      "recommendedShelter": {
        "name": "Central Elevated Community Shelter",
        "distanceKm": 1.45
      }
    }
  }
  ```

---

### 3. 📶 Offline Peer-to-Peer Chat & Mesh Sync

#### A. Register Device P2P Identifier & Encryption Key
* **Method**: `POST /api/v1/p2p/register`
* **Auth**: Required
* **Body**:
  ```json
  {
    "p2pPeerId": "BT_MAC_00:1B:44:11:3A:B7",
    "devicePublicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8...",
    "deviceName": "Vivek's Phone"
  }
  ```

#### B. Get Nearby Peer's Public Key for Encrypted Messaging
* **Method**: `GET /api/v1/p2p/peers/:targetUserId`
* **Description**: Fetches public key to encrypt Bluetooth/Wi-Fi Direct messages locally.

#### C. Sync Offline Buffered Mesh Messages
* **Method**: `POST /api/v1/p2p/sync-mesh`
* **Body**:
  ```json
  {
    "messages": [
      {
        "senderPeerId": "BT_MAC_00:1B:44:11:3A:B7",
        "recipientPeerId": "BT_MAC_99:2A:11:88:FF:C1",
        "encryptedPayload": "ENCRYPTED_TEXT_BASE64",
        "messageType": "chat",
        "timestamp": 1712860000000
      }
    ]
  }
  ```

---

### 4. 🚨 SOS & AI Rescue Prioritization

#### A. Trigger SOS
* **Method**: `POST /api/v1/sos`
* **Auth**: Required
* **Body**:
  ```json
  {
    "crisisTypeId": "670...",
    "location": {
      "type": "Point",
      "coordinates": [77.2090, 28.6139]
    },
    "message": "Water reached 4 feet, senior citizen trapped.",
    "medicalEmergency": true,
    "peopleCount": 3
  }
  ```
* **Feature**: The backend calculates an **AI Triage Score (1–10)** automatically based on user age, medical conditions, and vulnerable family members to prioritize emergency dispatch.

#### B. Active Triage Queue (Responders & Admins)
* **Method**: `GET /api/v1/sos/triage/queue`
* **Description**: Returns all active emergencies sorted by highest urgency triage score first.

---

### 5. 📢 Citizen Incident Reports & Operational Dashboard

#### A. Report Hazard / Incident
* **Method**: `POST /api/v1/incidents`
* **Body**:
  ```json
  {
    "crisisTypeId": "670...",
    "title": "Road collapsed near River Bridge",
    "description": "Bridge approach road washed away, vehicles stranded.",
    "severity": "high",
    "location": {
      "type": "Point",
      "coordinates": [77.2100, 28.6150]
    },
    "reportedNeeds": ["Evacuation boat", "Medical aid"],
    "affectedPeopleCount": 15
  }
  ```

#### B. Unified Operational Dashboard (For Authorities)
* **Method**: `GET /api/v1/incidents/dashboard/operational`
* **Response**: Real-time shelter occupancy rate, active SOS count, verified incident stats, and disaster overview.

---

### 6. 👤 User & Medical Profile (Personalization Engine)

* **Update Profile (Personalized RAG & Triage)**:
  * **Method**: `PATCH /api/v1/users/profile`
  * **Body**:
    ```json
    {
      "name": "Vivek",
      "age": 28,
      "bloodGroup": "O+",
      "medicalConditions": ["Asthma"],
      "specialNeeds": "Requires ground floor access"
    }
    ```
* **Family Members**:
  * `POST /api/v1/family` (Add member with age, relation, blood group)
  * `GET /api/v1/family`
* **Emergency Contacts**:
  * `GET /api/v1/emergency-contacts`
  * `POST /api/v1/emergency-contacts`

