# 🛰️ Vanguard: 3D Rocket Streak Tracker & Space Recovery Pass
A clean, private, offline-first tactical console designed to help individuals monitor, visualize, and sustain self-control journeys. By translating behavioral recovery milestones into physical 3D rocket progression, Vanguard turns the process of breaking difficult habits into an interactive, visual spaceflight mission.

---

## 🌌 The Vision
Vanguard operates on a fundamental principle: **absolute visual feedback and complete user privacy.** 

Breaking highly addictive patterns requires daily commitment and positive feedback loops. Vanguard provides this by placing the user at the helm of an interplanetary recovery vessel. Every day of self-control adds propellant, stabilizes ship life-support, and advances your biological timeline. 

No external servers, no cloud tracking, and no invasive telemetry. Your recovery data is kept strictly inside a secure, sandboxed local database, visible only to you.

---

## 🛠️ Tactical Architecture

### 1. Interactive 3D Propulsion Loop (`ThreeDRocket.tsx` & `FlameSelector.tsx`)
* **Real-time Engine Simulation**: Represents your active streaks through a dynamic 3D WebGL rocket render. The velocity, stability, and trajectory of the flight correspond mathematically to your current consecutive days of self-control.
* **Propulsion Diagnostics**: Customize fuel compositions and visual thrust signatures (e.g., Plasma Blue, Ion Orange, Fusion Green) through an interactive tactical flame panel.

### 2. Biometric Fingerprint Check-in
* **Tactile Ignition**: A highly responsive, pressure-sensitive virtual biometric sensor initiating the engine start sequence.
* **Synchronized Audio-Visual Feedback**: Dynamic auditory indicators and spatial haptics trigger custom engine rumbling, hydraulic pressure releases, and high-energy thruster ignitions.

### 3. Space Recovery Pass (`ProfileCard.tsx`)
* **High-Fidelity Social Telemetry**: A stylized, science-fiction identity card displaying your pilot profile, rank, exact registration date, and individual "active sector" tracking indicators.
* **Custom Dynamic Canvas Renderer**: Leverages HTML5 Canvas to seamlessly combine user avatars (retrieved locally via IndexedDB) with real-time vector graphics.
* **Instant Export**: Downloads as a polished, high-resolution `.png` file ready to share with accountability networks or keep as a personal milestone token.

### 4. Bilingual Clinical Telemetry (English & বাংলা)
* **Biological Progress Tracking**: Dynamic day-by-day medical, physical, and cognitive recovery reports.
* **Comprehensive Metrics**: Tracks cellular repair, lung capacity restoration, dopamine receptor upregulation, and cardiac stabilization.
* **Vocal Flight Computer**: A built-in, low-latency text-to-speech engine reads out daily physiological diagnostic reports, offering hands-free briefing on your recovery status.

### 5. Clandestine Offline Core (`sqliteEngine.ts`)
* **Isolated Relational Ledger**: Completely powered by a local Web-SQL/SQLite layer.
* **SQLite Terminal Terminal Inspector**: An built-in database console allowing developers and technical users to run raw SQL statements, inspect table schemas, and verify that data is strictly self-contained.

---

## 📂 Project Structure

```bash
├── src/
│   ├── components/
│   │   ├── ProfileCard.tsx      # Handles Canvas generation & 3D card visualization
│   │   ├── ThreeDRocket.tsx     # 3D interactive WebGL/Three.js rocket simulation
│   │   ├── FlameSelector.tsx    # Thruster flame customization console
│   │   └── SQLiteInspector.tsx  # Raw SQL terminal for database telemetry
│   ├── lib/
│   │   ├── sqliteEngine.ts      # Offline database queries & core streak state engine
│   │   ├── avatarStorage.ts     # Local IndexedDB handling for secure profile pictures
│   │   └── soundEffects.ts      # Spatial audio synthesis & tactile soundscapes
│   ├── data/
│   │   └── healthImprovements.ts# Medical & cognitive progression reference datasets
│   ├── App.tsx                  # Main cockpit interface, layout routing, & check-in loop
│   └── types.ts                 # Shared data structures and type safety definitions
├── package.json                 # Dependency manifests & system scripts
└── vite.config.ts               # Bundling configurations and alias maps
```

---

## ⚡ Technical Setup

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **npm** or **bun** for package management

### 1. Installation
Pull down the project dependencies:
```bash
npm install
```

### 2. Run the Development Server
Launch the local console on port `3000`:
```bash
npm run dev
```

### 3. Build for Production
To bundle Vanguard into a optimized, self-contained single-page application:
```bash
npm run build
```
The compiled output will be placed in the `dist/` directory, structured for static hosting.

---

## 🎛️ Flight Cockpit Guide

1. **Establish Your Identity**: Input your name, select your preferred language (English or বাংলা), upload a profile avatar (stored safely in IndexedDB), and select the specific "Active Sectors" (habits like Alcohol, Porn, Smoking, or Drugs) you want to track.
2. **Ignite the Core Daily**: Every 24 hours, perform a tactile hold on the biometric check-in panel. A successful check-in adds a day to your streak, fueling the rocket engine and maintaining your trajectory.
3. **Analyze Clinical Diagnostics**: Access the Dashboard or Habits panel to view your real-time biological telemetry. Review metrics on neural repair, receptor density, and organ health improvements. Click the speaker icon to have the Flight Computer voice your current biological status.
4. **Issue Your Space Pass**: Head to the Pass tab to see your active pilot credentials. Click the **Download Space Pass** button to trigger the high-resolution canvas engine and save your visual certificate.
5. **Inspect the Ledger**: Open the SQLite terminal tab to view the live relational tables. Execute custom queries to audit your data or directly examine the structural consistency of your logs.

---

## 🛡️ Security & Integrity Principles
* **Local Sandboxing**: Data is strictly stored using the browser's persistent client-side Web SQL database. No network packets containing personal logs or habit tracking are ever dispatched.
* **Zero Tracker Integration**: Completely free of analytics software, cloud telemetry, or third-party behavioral trackers.
* **Cryptographic-Style Identity**: User avatars are stored directly inside IndexedDB as base64-encoded binary blobs under custom keys, eliminating file system leakage.
