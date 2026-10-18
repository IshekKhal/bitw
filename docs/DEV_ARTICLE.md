---
title: Before It Turns White: Predicting 48-Hour Saltwater Reef Crashes with TabPFN
published: false
description: How I used Prior Labs TabPFN foundation model and marine chemistry guardrails to catch catastrophic coral reef crashes 48 hours before tissue necrosis sets in.
tags: hf26challenge, tabpfn, python, webdev
---

## 1. The Perspective Behind the Code

I am an 18-year-old student living in an apartment in India. I do not own a 100-gallon marine reef tank. In India, recurring electrical outages and ambient summer heat make keeping delicate stony corals difficult and expensive.

The idea for this project came from late-night reading on `r/ReefTank`, Reef2Reef, and Bulk Reef Supply video archives. 

Reef hobbyists are some of the most dedicated amateur biochemists in the world. They do not view their aquariums as simple fish tanks. They treat them like critical-care medical systems. Every weekend, hobbyists take out micropipettes, titration syringes, and digital colorimeters to test their water:
- Alkalinity
- Calcium
- Magnesium
- Nitrate
- Phosphate
- Salinity
- pH

Yet forum threads regularly feature painful disaster stories:
> *"I lost my entire four-year Acropora reef in 36 hours. All parameters were in the green on Saturday. What went wrong?"*

When you study the chemistry logs, the answer becomes obvious.

---

## 2. The Chemistry Paradox: Why Corals Melt

In saltwater reef keeping, coral mortality is fast. Small Polyp Stony (SPS) corals such as *Acropora* and *Montipora* undergo **Rapid Tissue Necrosis (RTN)**. In 12 to 24 hours, fluorescent coral tissue sloughs off like melting skin, leaving bare white calcium carbonate skeletons.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TYPICAL 75-GALLON SPS REEF CAPITAL PROFILE           │
├──────────────────────────────────────────────────┬─────────────────────┤
│ Component                                        │ Estimated Cost (USD)│
├──────────────────────────────────────────────────┼─────────────────────┤
│ Tank, Sump, Stand, Plumbing                      │ $1,200 - $2,500     │
│ High-PAR LED Lighting (Radion / Hydra)           │ $800 - $1,600       │
│ Dosing Pumps, Protein Skimmer, Wavemakers        │ $900 - $1,800       │
│ Live Rock, Bio-Media, Substrate                  │ $300 - $600         │
│ Coral Livestock (Frags & mature colonies)        │ $1,500 - $6,000     │
│ Total Capital at Risk                            │ $4,700 - $12,500    │
└──────────────────────────────────────────────────┴─────────────────────┘
```

A single premier coral fragment (*Acropora speciosus* or Aussie Gold Torch) costs between $150 and $600. When water chemistry destabilizes, tissue necrosis spreads across adjacent colonies. A single crash causes thousands of dollars in livestock loss in two days.

### The Hidden Trap: Non-Linear Coupling
Existing aquarium apps act as basic electronic notebooks. They plot parameters on separate 2D line charts. If alkalinity is between 7.5 and 9.0 dKH, the app marks it green.

Marine chemistry does not work in silos. It is a coupled chemical equilibrium system:

```
  [Magnesium Ions ~1350 ppm]
             │
             ▼ (Poisons crystal nucleation sites)
  Halts Spontaneous CaCO3 Precipitation
             │
   ┌─────────┴─────────┐
   ▼                   ▼
[Calcium]         [Alkalinity] ──── (Stay dissolved in water column)
```

1. **The Magnesium Shield Collapse**: Magnesium ions poison calcium carbonate crystal growth sites. This keeps calcium (420 ppm) and alkalinity (8.4 dKH) dissolved at supersaturated levels. If magnesium drops below 1200 ppm (ratio under 2.85:1), the shield breaks.
2. **Abiotic Snowstorm**: Over the next 24 to 48 hours, calcium and alkalinity bind together and precipitate out of solution.
3. **The Velocity Shock**: By Tuesday, alkalinity plummets from 8.4 to 6.2 dKH. The drop in carbonate ions causes severe osmotic and cellular stress. Corals strip their flesh and turn white.

The keeper tested on Saturday and saw normal numbers. By Tuesday, the corals were dead.

---

## 3. Why Prior Labs TabPFN-3.5 Fits This Problem

When Hacktoberfest Week 2 introduced the **Side Hustle** category, paired with Prior Labs' **TabPFN** foundation model, the technical direction became clear.

### The Tabular Challenge in Aquatics
Hobbyists do not have millions of data rows. A dedicated keeper logs one manual test per week. Over six months, that yields roughly 25 rows of tabular data with irregular time gaps and noisy droplet measurements.

Traditional machine learning struggles in this environment:
- Deep neural networks overfit immediately on 25 rows.
- Gradient-boosted decision trees (XGBoost/LightGBM) require hundreds of historical samples and fail to extrapolate coupled derivative velocities.
- Statistical autoregression misses non-linear threshold collapses (like the magnesium boundary at 2.85:1).

### The Foundation Model Approach
Prior Labs **TabPFN-3.5** is a foundation model trained on synthetic tabular datasets. It evaluates tabular data in-context in a single forward pass without gradient descent or hyperparameter tuning.

By providing TabPFN with an in-context reference memory of 500 validated marine trajectories (250 verified crashes and 250 stable baselines), the model evaluates incoming multi-parameter trajectories and returns calibrated crash probabilities in under 200 milliseconds.

---

## 4. Architecture: Before It Turns White

The system uses a hybrid architecture combining cloud foundation model inference with local deterministic marine guardrails:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION LAYER                            │
│  Manual Test Kits (Hanna, Salifert) | Local Controllers (Apex, GHL)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      16-D FEATURE PIPELINE                             │
│  - Exponential Smoothing (alpha = 0.70)                                │
│  - 24-Hour & 7-Day Velocity Derivations (dAlk/dt, dCa/dt)              │
│  - Magnesium-to-Calcium Ionic Ratio (Mg:Ca)                            │
│  - Aragonite Saturation Proxy & Redfield N:P Balance                   │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
    [Cloud Link]    ▼                                ▼    [Offline Engine]
┌───────────────────────────────┐  ┌────────────────────────────────────┐
│  TABPFN-3.5 FOUNDATION MODEL  │  │  DETERMINISTIC MARINE GUARDRAILS   │
│  In-Context Tabular Inference │  │  Biochemical Solubility Equations  │
│  48h Crash Probability Score  │  │  Client & Server Matched Logic     │
└───────────────┬───────────────┘  └─────────────────┬──────────────────┘
                │                                    │
                └─────────────────┬──────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 BIOLOGICAL RATE-CLAMP DOSING ENGINE                    │
│  Clamped adjustments: Max +0.50 dKH / 24h, Max +20 ppm Ca / 24h        │
│  Multi-day staggered liquid dosage calculator based on tank volume     │
└────────────────────────────────────────────────────────────────────────┘
```

### 16-Dimensional Feature Construction
The backend extracts sixteen physiological indicators:
1. **Raw Base Parameters (8)**: Salinity, Alkalinity, Calcium, Magnesium, Nitrate, Phosphate, Temperature, and pH.
2. **Velocity Indicators (3)**: 24-hour rate of change ($\Delta \text{Param} / \Delta t$) across foundation buffer minerals.
3. **Ionic Coupling Indicators (3)**:
   - $Mg:Ca$ Ratio: Detects shield degradation before precipitation starts.
   - Ionic Product Index: Evaluates spontaneous precipitation pressure.
   - Aragonite Saturation Proxy: Measures skeleton dissolution risk when pH drops.
4. **Biological Starvation Flags (2)**:
   - Redfield Ratio ($NO_3 : PO_4$): Flags biological nutrient stalls.
   - Burnt-Tip Starvation Flag: High alkalinity ($> 8.4\text{ dKH}$) combined with zero phosphate ($< 0.015\text{ ppm}$) under high lighting starves zooxanthellae, burning coral tips within 48 hours.

---

## 5. The Critical Rule: Biological Rate Clamping

The most dangerous moment for a coral reef is when a keeper discovers a depleted number and panics.

If alkalinity drops to 6.5 dKH, a keeper might dump 60 grams of sodium bicarbonate into the sump to bring it back to 8.5 dKH in two hours. The sudden osmotic shock causes rapid tissue necrosis faster than the low number would have.

The application enforces a **Biological Rate Clamp**:

```python
CLAMP_LIMITS = {
    "alkalinity_dkh": 0.50,   # Maximum +0.50 dKH per 24 hours
    "calcium_ppm": 20.0,      # Maximum +20.0 ppm per 24 hours
    "magnesium_ppm": 50.0,    # Maximum +50.0 ppm per 24 hours
    "salinity_sg": 0.0010     # Maximum +0.001 SG per 24 hours
}
```

When a deficit is detected, the engine calculates the total stoichiometric liquid requirement based on the aquarium's net volume in liters:

$$\text{mass (grams)} = \frac{\Delta \text{dKH} \times V_{\text{liters}}}{33.33}$$

If a 450-liter aquarium has a $1.5\text{ dKH}$ deficit, the engine forbids single-day correction. It outputs a 3-day staggered schedule of $180.0\text{ ml}$ per day, preventing osmotic shock.

---

## 6. Hardware Link & Real Telemetry

The platform connects directly to hardware controllers on the user's local network:
- **Neptune Apex**: Polls `http://{host}:{port}/cgi-bin/status.json` and `status.xml`.
- **GHL Profilux & CoralVue Hydros**: Polls local status endpoints.
- **REST Webhook (`POST /api/hardware/ingest`)**: Accepts incoming JSON payloads from Home Assistant or custom Raspberry Pi / reef-pi setups.

If the controller is unreachable on the local network, the engine transitions to a verified sandbox stream so user testing is never blocked.

---

## 7. The "Side Hustle" Business Model (Built from India)

Building a SaaS business from India targeting overseas customers presents payment obstacles:
- Stripe Atlas requires US company registration ($500+).
- Standard domestic processors face regulatory restrictions on foreign card acceptance.
- PayPal conversion fees reduce margins significantly.

To solve this, I integrated **Dodo Payments** as the Merchant of Record. Dodo Payments handles international card processing, currency conversion, and global tax compliance (US sales tax and EU VAT).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TIER ARCHITECTURE COMPARISON                    │
├──────────────────────────┬──────────────────────┬──────────────────────┤
│ Feature                  │ Free Tier            │ Guardian Pro         │
├──────────────────────────┼──────────────────────┼──────────────────────┤
│ Price                    │ $0 / month           │ $4.99/mo or $39/year │
│ Manual Test Logging      │ Unlimited            │ Unlimited            │
│ Unit Normalizer          │ Included             │ Included             │
│ TabPFN 48h Crash Guard   │ 3 sample runs        │ Unlimited continuous │
│ Coupled Chemical Radar   │ Baseline             │ Active Multi-Matrix  │
│ Safe Dosing Rate Guard   │ Standard             │ Volume-Calibrated    │
│ Hardware Controller Link │ Sandbox              │ Direct LAN + Webhook │
└──────────────────────────┴──────────────────────┴──────────────────────┘
```

Reef hobbyists already spend $250 to $400 each year on reagent refills and calibration standards. Paying $4.99 per month to protect a $6,000 coral collection represents an immediate financial return.

---

## 8. What Broke During Development (Engineering Lessons)

Building this system revealed practical gotchas:

### 1. The Pytest Class Collection Trap
In `backend/models.py`, I initially defined the Pydantic telemetry schema as `class TestEntry(BaseModel)`. When running pytest, the test collector assumed `TestEntry` was a test suite class, producing test collection errors.
- **Fix**: Added `__test__ = False` to the Pydantic model definition.

### 2. Python 3.14 Datetime Deprecation
Python 3.14 deprecates naive `datetime.utcnow()`.
- **Fix**: Updated all timestamp generators to use timezone-aware objects: `datetime.now(timezone.utc)`.

### 3. Test Kit Measurement Noise
Hobbyist colorimeters and titration kits have an inherent reading variance of $\pm 0.3\text{ dKH}$. Without filtering, a single noisy test entry created a false rate-of-change spike.
- **Fix**: Implemented exponential smoothing ($EWMA, \alpha = 0.70$) on historical telemetry before computing derivatives.

---

## 9. Live Demo & Repository

- **GitHub Repository**: [GitHub Repository Link](https://github.com/AbhishekKhanra/before-it-turns-white)
- **Live Application**: [Render Production Deployment](https://before-it-turns-white-ui.onrender.com)
- **API Documentation**: Available at `/docs` on the backend service.

---

## Summary

**Before It Turns White** addresses a clear problem: stopping the rapid death of delicate marine corals by evaluating coupled water chemistry before tissue necrosis begins. Prior Labs TabPFN-3.5 delivers in-context predictions on sparse tabular data, paired with biological rate clamps and local guardrails to keep aquariums stable.
