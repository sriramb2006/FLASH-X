# FLASHX OS — Autonomous Travel Intelligence Operating System
> **"Beyond Booking. Beyond Navigation. Beyond Travel."**  
> *Tagline: "Travel intelligently. Arrive confidently."*  
> *Core Philosophy: "Don't just book a seat. Orchestrate the entire journey."*

---

## 1. Executive Summary

**FLASHX OS** is the world's first autonomous travel intelligence operating system. It advances traditional Outstation Bus Reservation Systems (OBRS) into an end-to-end mobility orchestration platform. 

Instead of treating travel as a static ticket transaction, FLASHX OS connects schedules, weather radar, route congestion, coach cabin equipment, personal passenger preferences, and nocturnal safety assistance into a unified experience.

### Three Unified Experiences:
1. **Passenger Experience (`/`, `/search`, `/seats/:id`, `/checkout`, `/tickets/:id`, `/dashboard`)**:
   - Interactive corridor planning with autocomplete across Indian hubs (Coimbatore, Bengaluru, Chennai, Madurai, Kochi, Hyderabad).
   - Real-time 2-deck seat selection (2+1 sleeper layout) backed by server-side atomic seat holds (5-minute expiring countdown).
   - Secure sandbox checkout with dynamic GST, platform fee, promo codes (`FLASHX2026`, `EARLYBIRD`), and cryptographic digital boarding passes with gate verification QR codes.
   - Comprehensive Passenger Hub featuring live journey telemetry, pre-trip milestones, safety heartbeats, personal travel DNA, and carbon offset tracking.
2. **Operator & Administrative Experience (`/admin`, `/operator`)**:
   - Fleet capacity management, departure dispatch, seat pricing configuration, passenger manifests, and revenue analytics.
   - Immutable system audit logs, automated CSV report export, and one-click database reseed tools.
3. **FLASHX Intelligence Engine (`/intelligence`, floating AI Assistant, Voice Planner)**:
   - Real-time Journey Success Score™ (0-100 explainable index).
   - Smart Seat Intelligence™ position-based recommendations.
   - AI Delay Predictor™ considering departure time congestion.
   - Women Safety Mode™ with grouped berths, boarding SMS triggers, and nocturnal safety checks.
   - Family Travel Monitor™ with privacy-safe, expiring read-only tracking links (`/track/:token`).
   - Voice-to-Journey™ natural language trip parameter parser.
   - Conversational AI Travel Assistant powered by server-side Gemini 3.8 Flash SDK.

---

## 2. The Six Connected Intelligence Modules

| Module | Purpose | Realized Features in FLASHX OS |
| :--- | :--- | :--- |
| **FlashMind™** | Journey Intelligence & Scoring | Multi-criteria ranking, Journey Success Score™ (30% punctuality, 20% weather, 25% operator rating, 15% comfort, 10% buffer), arrival constraint validation. |
| **FlashGuardian™** | Safety & Real-Time Risk Shield | Women Safety Mode™, emergency contact SMS triggers, automated 60-min night check-in heartbeat, one-tap emergency SOS protocol. |
| **FlashDNA™** | Autonomous Personalization | User-controlled travel traits (lower vs upper berth, window vs aisle, AC preference). Zero dark tracking; 100% reviewable and resettable. |
| **FlashRoute™** | Multi-Leg Graph Optimization | 1-stop connecting coach itineraries when direct options are constrained, guaranteed 45m+ connection buffer at highway rest hubs. |
| **FlashTimeline™** | End-to-End Orchestration | Pre-trip preparation notice (-3h), boarding bay check-in (-30m), departure, highway rest stop, and destination arrival ETA. |
| **FlashReplay™** | Journey Memory & Ecology | Personal travel ledger, carbon savings vs flying (~68 kg CO2 saved per passenger), punctuality percentage, verified coach reviews. |

---

## 3. Technology Stack & Architecture

- **Frontend**:
  - React 19 + TypeScript
  - Tailwind CSS v4 + Custom Metallic Charcoal & Electric Gold Brand System
  - Vite 8.3
  - React Router v7
  - Lucide Icons & Canvas-Confetti
- **Backend**:
  - Node.js + Express + TypeScript (`tsx`)
  - Server-side `@google/genai` TypeScript SDK (model `gemini-3.8-flash`)
  - Concurrency-safe atomic seat hold manager with expiration locks
  - Cryptographic ticket verification endpoint (`/api/tickets/verify/:ticketRef`)
- **Database & Persistence**:
  - Authoritative JSON database (`data/flashx-db.json`) with atomic synchronization
  - Persistent Indian intercity corridor inventory, user preferences, emergency contacts, bookings, and audit trail

---

## 4. Quick Start & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `GEMINI_API_KEY` is configured if testing real-time generative capabilities (the system automatically uses intelligent deterministic fallback if no key is present).

### 3. Start Development Server
```bash
npm run dev
```
The server will boot on port `3000` (`http://localhost:3000`).

### 4. Run Automated E2E & Integration Tests
```bash
npm test
```
Executes the comprehensive automated test suite covering authentication, search scoring, concurrency holding, booking checkout, QR verification, cancellation refunds, and admin metrics.

---

## 5. Multi-Role Portals & Credentials

The system provides dedicated role-isolated login (`/login`) and passenger registration (`/register`). Each role has strict access boundaries:

| Role Portal | Username | Password | Dedicated View | Role-Specific Capabilities & Boundaries |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `pass` | `/admin` | **Can see EVERYTHING**: Platform gross revenue, all bookings across all fleets, User Accounts Directory, System Audit Logs, CSV export, and Database reseed. |
| **Fleet Operator** | `operator` | `pass` | `/operator` | **Fleet & Coach Telemetry**: Manage fleet inventory, add new buses, configure berth layouts, deploy departures, inspect passenger seat manifests for their buses. *(Restricted from system revenue, user management, and audit logs)* |
| **Passenger** | `passenger` (or register at `/register`) | `pass` (or chosen password) | `/dashboard` | **Traveler Hub**: Search buses, interactive 2-deck seat selection with atomic holds, printable digital tickets with QR validation, FlashGuardian safety heartbeats, Women Safety Mode. *(Restricted from fleet dispatch and admin controls)* |

---

## 6. Integration Status & Integrity Matrix

In accordance with strict integrity guidelines, all data sources and integrations are classified honestly:

| Feature / Module | Status | Backend Service | Data Source |
| :--- | :--- | :--- | :--- |
| **Intercity Bus Discovery** | ✅ Fully Functional | `GET /api/buses/search` | Seeded Indian Corridors (Coimbatore, Bengaluru, Chennai, Madurai, Kochi, Hyderabad) |
| **Atomic Seat Hold Concurrency** | ✅ Fully Functional | `POST /api/seats/hold` | In-memory + Disk atomic lock with 5-minute countdown |
| **Cryptographic Ticket Issuance** | ✅ Fully Functional | `POST /api/bookings/checkout` | Server-side booking ledger + opaque QR verification endpoint |
| **Ticket Checkpoint Verification** | ✅ Fully Functional | `GET /api/tickets/verify/:ref` | Real backend ticket verification endpoint |
| **Cancellation & Refund Engine** | ✅ Fully Functional | `POST /api/bookings/:id/cancel` | Dynamic policy: >6h (100%), 2-6h (50%), <2h (0%) |
| **Journey Success Score™** | ✅ Fully Functional | `server/intelligence.ts` | Multi-factor deterministic algorithm (clearly labeled as estimated) |
| **Smart Seat Intelligence™** | ✅ Fully Functional | `server/intelligence.ts` | Berth position telemetry (motion stability, wheelbase vibration reduction) |
| **Family Travel Monitor™** | ✅ Fully Functional | `GET /api/family/track/:token` | Read-only expiring token without disclosing personal identity or ticket secrets |
| **AI Travel Assistant** | ✅ Fully Functional | `POST /api/ai/assistant` | Server-side Gemini 3.8 Flash SDK with offline fallback |
| **Voice-to-Journey™** | ✅ Fully Functional | `POST /api/ai/voice-parse` | Web Speech API + Gemini intent extraction with preset audio samples |
| **Payment Gateway** | 🛡️ Labeled Sandbox | `POST /api/bookings/checkout` | Clearly disclosed Simulated PCI Sandbox Mode (Zero real financial charges) |

---

## 7. Security & Concurrency Design

1. **Concurrency Protection**: When two travelers attempt to select the same berth concurrently, the backend enforces atomic locking. Competing sessions receive a `409 Conflict` and prompt seat re-selection.
2. **Privacy-Preserving Family Sharing**: The Family Monitor link (`/track/:token`) intentionally redacts ticket QR codes, traveler phone numbers, email addresses, and payment details.
3. **Emergency SOS Protocol**: Broadcasts alerts with a 3-second abort safeguard to prevent accidental panic dispatches while keeping a verifiable audit trail.
4. **Zero Client Secrets**: All Gemini SDK API calls are handled exclusively server-side in `server/intelligence.ts`.
