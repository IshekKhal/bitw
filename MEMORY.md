# Before It Turns White - Memory Bank

## Project Identity
- **Name:** Before It Turns White
- **Tagline:** 48-Hour Predictive Water Chemistry Crash Guard for Saltwater Coral Reefs
- **Target Event:** Hacktoberfest 2026 Week 2 ("Side Hustle")
- **Target Category:** Prior Labs TabPFN ($200 Featured Category)
- **Deployment Platform:** Render (Web Service + Static Site)

## Architecture Overview
- **Edge Hybrid Topology:**
  - Client-side React/Vite single page app with high-contrast marine telemetry dashboard, biological radar, interactive 48h crash timeline, and offline chemical guardrails engine.
  - Backend FastAPI service hosted on Render integrating Prior Labs `tabpfn-client` (TabPFN-3.5 foundation model) using in-context tabular learning over curated marine chemical crash trajectories.
  - Stoichiometric dosing engine enforcing biological daily clamps (maximum +0.5 dKH/24h, +20 ppm Ca/24h, +50 ppm Mg/24h) and multi-day ramp schedules.
  - Dodo Payments integration for Merchant of Record global subscription processing ($4.99/mo or $39/yr).

## Key Parameters & Marine Chemistry Truths
- **Alkalinity (dKH):** Dissolved carbonate and bicarbonate ions. The building bricks for coral aragonite skeletons. Swings exceeding 1.0 dKH/24h trigger Rapid Tissue Necrosis (RTN).
- **Calcium ($Ca^{2+}$):** 400 - 440 ppm. The mortar that binds with carbonate to form $CaCO_3$.
- **Magnesium ($Mg^{2+}$):** 1300 - 1380 ppm. The chemical shield. Normal seawater ratio $Mg:Ca \approx 3.2:1$. When $Mg < 1200$ ppm or ratio $< 2.85$, magnesium fails to poison abiotic calcite seed crystals, triggering spontaneous precipitation of calcium carbonate ("snowstorm") and stripping alkalinity from the water column.
- **Nitrate ($NO_3^-$) & Phosphate ($PO_4^{3-}$):** Trace nutrients for symbiotic zooxanthellae. Zero phosphate combined with elevated alkalinity ($> 9.0$ dKH) burns growing coral tips and induces tissue detachment.
- **pH:** 8.1 - 8.4. Below 7.8, aragonite skeletal dissolution begins.
- **Salinity:** 1.025 - 1.026 SG (35.0 ppt). Osmotic balance regulator.

## 16-Dimensional Engineered Feature Vector
1. `salinity_sg`
2. `alkalinity_dkh`
3. `calcium_ppm`
4. `magnesium_ppm`
5. `nitrate_ppm`
6. `phosphate_ppm`
7. `temperature_c`
8. `ph`
9. `alk_velocity_24h`
10. `ca_velocity_24h`
11. `mg_velocity_24h`
12. `mg_ca_ratio`
13. `ionic_product_index`
14. `redfield_nutrient_ratio`
15. `nutrient_starvation_flag`
16. `testing_cadence_days`

## Environment & Dependency State
- Python: 3.14.4
- Node.js: v25.7.0, npm: 11.11.0
- Key Python Libraries: `fastapi`, `uvicorn`, `pydantic`, `numpy`, `scipy`, `scikit-learn`, `tabpfn-client`, `dodopayments`, `pytest`, `httpx`
- Environment Variables:
  - `TABPFN_TOKEN` / `PRIOR_LABS_API_KEY`
  - `DODO_PAYMENTS_API_KEY`
  - `DODO_PAYMENTS_WEBHOOK_SECRET`
