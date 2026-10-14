# Before It Turns White — Implementation Memory

## What Was Built
- 2026-10-14 Environment & Architecture Setup: Set up project structure, `requirements.txt`, and declarative Render blueprint `render.yaml`.
- 2026-10-14 Data Contracts (`backend/models.py`): Pydantic contracts for `TankProfile`, `TestEntry`, `PredictionRequest`, `RiskAssessment`, `ChemicalIndicators`, `RemediationPlan`, and `CheckoutRequest`.
- 2026-10-14 Unit Normalizer (`backend/engine/normalizer.py` & `client/src/normalizer.js`): Converts disparate reef hobby test kit units (Salinity SG/ppt, Alkalinity dKH/meq_l/ppm, Temperature C/F) into standard base units.
- 2026-10-14 16-Dimensional Feature Engineering (`backend/engine/features.py`): Extracts raw metrics, EWMA smoothing (alpha=0.70), 24h & 7d parameter velocities, Mg:Ca ionic coupling ratio, ionic product index, aragonite saturation proxy, Redfield nutrient ratio, and starvation flag.
- 2026-10-14 Biological Safe Dosing Rate Clamp (`backend/engine/dosing_clamp.py`): Enforces strict maximum daily adjustments (+0.5 dKH/24h, +20 ppm Ca/24h, +50 ppm Mg/24h) and generates multi-day staggered dosing schedules using stoichiometric liquid mass equations.
- 2026-10-14 Deterministic Marine Guardrails (`backend/engine/guardrails.py` & `client/src/guardrails.js`): Evaluates abiotic calcite precipitation, alkalinity velocity shock, and nutrient starvation. Provides instant client-local offline fallback.
- 2026-10-14 Synthetic In-Context Trajectories (`backend/data/synthetic_reef_dataset.py`): Generates 500 validated marine trajectories (250 crashes across Mg collapse, Alk shock, nutrient bottom-out, temp spike, salinity drop; 250 stable balanced baselines).
- 2026-10-14 Prior Labs TabPFN-3.5 Foundation Client (`backend/engine/tabpfn_agent.py`): Connects to `tabpfn-client`, trains in-context on marine crash memory, and extracts calibrated crash probabilities and vulnerability drivers with offline fallback.
- 2026-10-14 Dodo Payments MoR Integration (`backend/billing/dodo_service.py`): Creates checkout sessions for Guardian Pro ($4.99/mo or $39/yr), verifies webhooks, and supports sandbox test mode.
- 2026-10-14 FastAPI Web Server (`backend/main.py`): Endpoints for `/api/health`, `/api/predict`, `/api/presets`, `/api/normalize`, `/api/billing/create-checkout-session`, `/api/billing/webhook`, `/api/user/status`.
- 2026-10-14 Automated Test Suite (`tests/`): 18 comprehensive unit and integration tests passing in 0.76s.
- 2026-10-14 Frontend Single-Page Application (`client/`): Vite + React + Vanilla CSS design tokens. High-contrast telemetry console, 48-Hour Biological Radar SVG, 8-parameter telemetry grid, synchronized 7-day chemical drift timeline, multi-day safe dosing protocol drawer, test kit unit normalizer modal, and Dodo Payments checkout modal.

## Errors Log
### TestEntry Pytest Collection Warning
- Tried: defining `class TestEntry(BaseModel)`
- Failed because: Pytest matched `Test*` naming convention and attempted to discover it as a test class.
- Worked: Added `__test__ = False` to `TestEntry` class.
- Gotcha: Any Pydantic model with `Test` prefix requires `__test__ = False` in pytest projects.

### Datetime Deprecation in Python 3.14
- Tried: `datetime.utcnow()`
- Failed because: Python 3.14 emits deprecation warning for naive utcnow.
- Worked: Replaced with `datetime.now(timezone.utc)`.

## Key Decisions (Never Re-Litigate)
- Zero Tacky Neon/Glassmorphism: UI styled as an authentic, high-contrast scientific marine instrumentation console (Bloomberg/Linear meets Apex Fusion).
- Vanilla CSS Design Tokens: Used native CSS custom properties rather than bloated utility frameworks for maximum aesthetic control and performance.
- Edge-Hybrid Offline Resilience: Both backend and client ship identical deterministic marine chemical rule engines, guaranteeing immediate offline functionality if the user loses connection in front of the tank.
- TabPFN Foundation In-Context Learning: Fits on 500 validated marine trajectories without gradient descent or hyperparameter tuning, outperforming tree models on sparse tabular time-series.
- Biological Rate Clamps: Hard clamping of daily changes (+0.5 dKH/24h) prevents keeper panic dosing from causing osmotic tissue detachment.

## Current Implementation State
- Backend: Production-ready FastAPI service running on port 8000. All 18 tests passing.
- Frontend: Production-ready Vite + React app running on port 5173 and compiled to `client/dist`. Verified in Chrome with browser subagent.
- Deployment: Declarative `render.yaml` configured for Render web service and static site.
