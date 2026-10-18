# Before It Turns White

**48-Hour Predictive Water Chemistry Crash Guard for Saltwater Coral Reefs**

![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.14-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)
![TabPFN](https://img.shields.io/badge/Prior_Labs-TabPFN--3.5-7C3AED?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-23%20Passed-10B981?style=flat-square)

---

## The Problem

In saltwater reef keeping, coral mortality is fast. Small Polyp Stony (SPS) corals such as *Acropora* and *Montipora* undergo Rapid Tissue Necrosis (RTN). Living coral tissue sloughs off within 12 to 24 hours, leaving bare white calcium carbonate skeletons.

Reef keepers test their water weekly using titration kits and digital colorimeters, measuring seven core parameters:
- Alkalinity
- Calcium
- Magnesium
- Nitrate
- Phosphate
- Salinity
- pH

Standard aquarium software acts as a digital logbook. It plots individual parameters on separate 2D line charts with static green and red bands. 

Water chemistry is a coupled equilibrium system. A tank can show:
- Alkalinity: 8.4 dKH (Nominal)
- Calcium: 420 ppm (Nominal)
- Magnesium: 1180 ppm (Depleted)

Because magnesium ions poison calcium carbonate crystal growth sites, depleted magnesium destroys the buffer shield. Within 24 to 48 hours, calcium and carbonate ions spontaneously precipitate out of the water column. Alkalinity drops rapidly, triggering osmotic shock and colony-wide tissue necrosis.

**Before It Turns White** evaluates multi-parameter drift rates and coupled ionic ratios to flag systemic crash signatures 48 hours before physical damage occurs.

---

## System Architecture

```
                        ┌──────────────────────────────────────────────────────────┐
                        │             PHYSICAL AQUARIUM TELEMETRY                  │
                        │  Manual Test Kits (Hanna, Salifert) | Local Controllers  │
                        │       (Neptune Apex, GHL Profilux, CoralVue Hydros)      │
                        └────────────────────────────┬─────────────────────────────┘
                                                     │
                                                     ▼
                        ┌──────────────────────────────────────────────────────────┐
                        │               UNIT NORMALIZER & EWMA FILTER              │
                        │        SG / ppt | dKH / meq/L / ppm | °C / °F            │
                        │           Exponential Smoothing (alpha = 0.70)           │
                        └────────────────────────────┬─────────────────────────────┘
                                                     │
                                                     ▼
                        ┌──────────────────────────────────────────────────────────┐
                        │           16-DIMENSIONAL BIOCHEMICAL VECTOR              │
                        │    8 Base Parameters | 24h & 7d Velocity Vectors         │
                        │   Mg:Ca Ratio | Aragonite Saturation Proxy | N:P Ratio   │
                        └──────────────┬────────────────────────────┬──────────────┘
                                       │                            │
             [Online / Cloud]          ▼                            ▼       [Offline Fallback]
┌──────────────────────────────────────────────┐    ┌──────────────────────────────────────────────┐
│       TABPFN-3.5 FOUNDATION MODEL            │    │     DETERMINISTIC MARINE GUARDRAILS          │
│   In-Context Tabular Inference Engine        │    │    Biochemical Solubility Equations          │
│   Trained on 500 validated trajectories      │    │    Stoichiometric Precipitation Checks       │
└──────────────────────┬───────────────────────┘    └──────────────────────┬───────────────────────┘
                       │                                                   │
                       └───────────────────────┬───────────────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────────────────────────┐
                        │         PREDICTIVE RISK EVALUATION & DIAGNOSIS           │
                        │   48h Crash Probability | Primary Chemical Driver        │
                        └──────────────────────────────┬───────────────────────────┘
                                                       │
                                                       ▼
                        ┌──────────────────────────────────────────────────────────┐
                        │           BIOLOGICAL RATE-CLAMP REMEDIATION              │
                        │    Max +0.50 dKH / 24h | Max +20 ppm Ca | Max +50 ppm Mg │
                        │        Staggered multi-day liquid dosage calculator      │
                        └──────────────────────────────────────────────────────────┘
```

---

## Core Capabilities

### 1. TabPFN-3.5 Foundation Model Integration
- Uses Prior Labs `tabpfn-client` to run zero-shot in-context inference on tabular time-series data.
- Fits directly on 500 validated marine trajectories without gradient descent or hyperparameter tuning.
- Detects non-linear interactions across sparse test histories where gradient-boosted trees overfit.

### 2. 16-Dimensional Biochemical Feature Engineering
- **Rate-of-Change Velocities**: Computes 24-hour and 7-day velocity ($\Delta P / \Delta t$) across buffer parameters.
- **Magnesium Shield Ratio**: Tracks the $Mg:Ca$ molar balance (nominal ~3.20:1). Flags abiotic calcite precipitation hazards when the ratio drops below 2.85:1.
- **Aragonite Saturation Proxy**: Evaluates carbonate availability against pH and calcium saturation.
- **Redfield Nutrient Coupling**: Tracks nitrogen-to-phosphorus ratios to identify phosphate starvation under high lighting.

### 3. Biological Rate Clamp Engine
Reef keepers often panic during chemical drops, dumping concentrated buffers into their sump. Sudden chemical swings kill corals faster than low numbers.
The dosing engine enforces hard biological clamps:
- Alkalinity: Maximum $+0.50\text{ dKH}$ per 24 hours.
- Calcium: Maximum $+20.0\text{ ppm}$ per 24 hours.
- Magnesium: Maximum $+50.0\text{ ppm}$ per 24 hours.

If a 450-liter tank has an alkalinity deficit of $1.5\text{ dKH}$, the engine schedules three staggered daily doses of $180.0\text{ ml}$ rather than a single shock dose.

### 4. Ecosystem Bioload Sensitivity
The engine modulates thresholds based on coral bioload:
- **SPS Dominant (Acropora)**: Alkalinity swing threshold is $\pm 0.35\text{ dKH/day}$. Swings $\ge 0.60\text{ dKH/day}$ trigger critical alerts.
- **LPS & Soft Corals**: Alkalinity swing tolerance expands to $\pm 0.65\text{ dKH/day}$.
- **Nano Reef (< 150 L)**: Stricter salinity bounds ($1.0235 - 1.0270\text{ SG}$) account for rapid evaporation.

### 5. Physical Controller & Webhook Ingestion
- Direct LAN polling for Neptune Apex (`/cgi-bin/status.json`, `status.xml`), GHL Profilux, and CoralVue Hydros.
- REST Webhook (`POST /api/hardware/ingest`) accepts JSON payloads from Home Assistant and reef-pi.
- Fallback sandbox stream runs when hardware is unreachable.

---

## Repository Structure

```
├── backend/
│   ├── billing/
│   │   └── dodo_service.py         # Dodo Payments checkout sessions and webhooks
│   ├── data/
│   │   └── synthetic_reef_dataset.py # 500 verified marine trajectories
│   ├── engine/
│   │   ├── agent.py                # TabPFN client and guardrail fallback coordinator
│   │   ├── dosing_clamp.py         # Liquid dosing formulas and biological clamps
│   │   ├── features.py             # 16-D chemical indicator pipeline
│   │   ├── guardrails.py           # Deterministic solubility rules
│   │   ├── hardware_controller.py  # LAN polling for Apex, GHL, Hydros
│   │   ├── normalizer.py           # Multi-unit test kit normalizer
│   │   └── tabpfn_agent.py         # Prior Labs foundation model wrapper
│   ├── main.py                     # FastAPI application endpoints
│   └── models.py                   # Pydantic data contracts
├── client/
│   ├── src/
│   │   ├── components/             # RadarChart, TelemetryGrid, Modals, Header
│   │   ├── App.jsx                 # Central application state and tab routing
│   │   ├── guardrails.js           # Client-side deterministic fallback engine
│   │   ├── normalizer.js           # Frontend unit normalization
│   │   └── storage.js              # LocalStorage persistence manager
│   ├── index.html
│   └── vite.config.js
├── docs/                           # PRD, Architecture, and Chemical specifications
├── tests/                          # 23 automated pytest test cases
├── render.yaml                     # Render deployment blueprint
└── requirements.txt                # Python dependencies
```

---

## Local Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- Prior Labs TabPFN API key (optional for offline guardrails mode)

### 1. Clone & Configure Backend
```bash
git clone https://github.com/IshekKhal/bitw.git
cd bitw

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example or create .env
echo "TABPFN_TOKEN=your_tabpfn_api_key_here" > .env
```

### 2. Run Tests
Verify all 23 backend unit and integration tests pass:
```bash
python -m pytest
```

### 3. Start Backend API
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API documentation is available at `http://127.0.0.1:8000/docs`.

### 4. Start Frontend Client
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Open `http://127.0.0.1:5173/` in your browser.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check, TabPFN cloud status, and billing mode |
| `POST` | `/api/predict` | Runs 48h crash inference on current test and history |
| `GET` | `/api/presets` | Returns 4 simulation archetypes |
| `POST` | `/api/normalize` | Converts raw test kit units into standard marine units |
| `POST` | `/api/hardware/poll` | Polls local LAN controller IP for probe data |
| `POST` | `/api/hardware/ingest` | Webhook endpoint for Home Assistant and reef-pi |
| `POST` | `/api/billing/create-checkout-session` | Creates Dodo Payments checkout session |

---

## Production Deployment

The project includes a declarative `render.yaml` blueprint:
1. Connect this repository to your Render account.
2. Select **New Blueprint Instance**.
3. Supply the environment variable:
   - `TABPFN_TOKEN`: Your Prior Labs access token.
4. Render provisions both the Python FastAPI web service and the static React UI.

---

## License

MIT License. Open-source for the global reef keeping and scientific community.
