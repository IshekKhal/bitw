# Product Requirements Document (PRD)

**Product Name:** Before It Turns White  
**Tagline:** 48-Hour Predictive Water Chemistry Crash Guard for Saltwater Coral Reefs  
**Author:** Abhishek Khanra  
**Date:** October 14, 2026  
**Target Category:** Prior Labs TabPFN ($200 Featured Category), Hacktoberfest Week 2 ("Side Hustle")  
**Target Deployment:** Render Web Service  

---

## 1. Executive Summary & Brand Identity

### 1.1 The Expression Behind the Name
In saltwater reef keeping, death is not a slow decline. Corals, particularly Small Polyp Stony (SPS) varieties like *Acropora* and *Montipora*, undergo a catastrophic cellular collapse known as **Rapid Tissue Necrosis (RTN)**. In a span of 12 to 24 hours, fluorescent, living coral tissue sloughs off like melting skin, leaving behind bare, stark-white calcium carbonate skeletons.

Reef keepers wake up, pour their morning coffee, walk up to their tank, and stare in disbelief at white bones where thousands of dollars of living marine life stood the night before.

The name **Before It Turns White** is not a generic startup badge. It is an expression of the exact operational window: the 48-hour countdown where invisible, non-linear chemical imbalances take root before physical tissue sloughs off. The purpose of this application is to detect that chemical signature and warn the keeper while the coral is still alive.

### 1.2 The Origin Story: The Honest Perspective
I am an 18-year-old student living in an apartment in India. I do not own a 100-gallon saltwater reef tank. I do not have a room-sized chiller or a thousand-dollar calcium reactor. In India, prolonged power outages and extreme ambient temperatures make keeping delicate saltwater corals rare and extraordinarily expensive.

The project originated during late-night study sessions through online marine biology channels and community forums (`r/ReefTank`, Reef2Reef, and Bulk Reef Supply video archives). 

What stood out was a strange contradiction: reef keepers are some of the most obsessive amateur scientists on the planet. They do not treat their tanks like pets; they treat them like dialyzed patients. Every weekend, they pull out micro-pipettes, titration syringes, and digital colorimeters (Hanna Checkers) to measure seven distinct chemical elements:
- Alkalinity
- Calcium
- Magnesium
- Nitrate
- Phosphate
- Salinity
- pH

Yet, despite measuring these numbers, forum threads are constantly filled with heartbreaking posts:
> *"I lost my entire 4-year Acropora collection in 36 hours. All parameters were in range on Saturday. Why did this happen?"*

When you examine the chemistry logs, the answer is clear: **water chemistry is not a list of separate numbers; it is a coupled, non-linear chemical equilibrium system.** A keeper tests their water and sees:
- Alkalinity: 8.4 dKH (Normal)
- Calcium: 420 ppm (Normal)
- Magnesium: 1180 ppm (Critically low, but ignored as secondary)

Because Magnesium is low, it stops inhibiting calcium carbonate precipitation. Over the next 24 hours, Calcium and Alkalinity spontaneously precipitate out of the water column in an invisible chemical cascade. By the time the keeper tests again on Tuesday, Alkalinity has crashed to 6.2 dKH. Corals undergo osmotic and cellular shock, and RTN wipes out the entire colony.

Human brains are bad at calculating non-linear cross-parameter rates of change. Existing aquarium apps are simply electronic notebooks with 2D line graphs that paint numbers green if they are within broad historical ranges, offering zero predictive insight.

When Hacktoberfest Week 2 announced the **Side Hustle** theme (building with open-source AI something someone would actually pay for, explicitly including niche hobby communities), and Prior Labs featured **TabPFN** (a foundation model designed for complex tabular datasets with small sample sizes), the solution became obvious. **Before It Turns White** applies TabPFN to multi-dimensional water chemistry telemetry to catch systemic crashes 48 hours before the skeleton shows.

---

## 2. Market Problem & Financial Stakes (Why People Pay)

### 2.1 The Financial Stakes of Saltwater Reefs
Saltwater reef keeping is not a casual hobby; it is a high-capital investment.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TYPICAL 75-GALLON SPS REEF CAPITAL PROFILE           │
├──────────────────────────────────────────────────┬─────────────────────┤
│ Component                                        │ Estimated Cost (USD)│
├──────────────────────────────────────────────────┼─────────────────────┤
│ Tank, Sump, Stand, Plumbing                      │ $1,200 - $2,500     │
│ High-Par LED / T5 Lighting (Radion / Hydra)      │ $800 - $1,600       │
│ Dosing Pumps, Protein Skimmer, Wavemakers        │ $900 - $1,800       │
│ Reverse Osmosis Deionization (RO/DI) System      │ $250 - $450         │
│ Live Rock, Bio-Media, Substrate                  │ $300 - $600         │
│ Coral Livestock (20-40 frags & mature colonies)  │ $1,500 - $6,000     │
│ Total System Capital at Risk                     │ $4,950 - $12,950    │
└──────────────────────────────────────────────────┴─────────────────────┘
```

A single premier coral frag (such as an *Acropora speciosus*, "Walt Disney" Tenuis, or Aussie Gold Torch) costs anywhere from **$150 to $600**. A mature colony can easily exceed **$1,500**.

When a chemical crash occurs, losses are rarely isolated to one coral. In an SPS tank, bacterial and osmotic RTN propagates across adjacent colonies within 48 hours. A single crash routinely causes **$1,000 to $4,000 in immediate losses**.

### 2.2 Existing Market Failure
Reef hobbyists already spend heavily on test kits:
- Hanna Instruments digital checkers: $65 each (keepers buy 3 to 4 checkers for Alkalinity, Phosphate, and Calcium).
- Reagent refills: $20 to $30 every few months.
- Testing consumables total: $250 to $400 annually.

Yet the software available to log these tests is primitive:
- **Aquarimate:** $9.99/year or $19.99 lifetime. It is a manual database that plots 2D lines. It has no machine learning, no cross-parameter coupling, and no predictive alarms.
- **Apex Fusion / Hydros:** Hardware dashboards that show live probe readings (pH, Temp, ORP). They do not predict chemical interactions or interpret manual test kit entries.
- **Paper notebooks and Excel:** Static cells with conditional formatting.

Hobbyists actively spend money on hardware and reagents to protect their investment. Paying **$4.99/month ($39/year)** for an intelligent tabular model that prevents a $1,500 wipeout is an obvious financial decision with an immediate return on investment.

---

## 3. Monetization & Payment Architecture (India-Viable)

### 3.1 The Global SaaS from India Challenge
Building a subscription software product from India faces specific payment infrastructure hurdles:
- Stripe Atlas requires US corporate registration ($500+).
- Stripe India has been invite-only and heavily restricted for new individual developers.
- Razorpay suspended international payments for newly onboarded micro-accounts due to RBI compliance directives.
- PayPal charges excessive currency conversion fees (4-7%) and has high checkout abandonment rates.

### 3.2 The Solution: Dodo Payments (Merchant of Record)
**Dodo Payments** is an emerging Merchant of Record (MoR) built specifically for developers in India building global software:
- **Compliance:** Operates as the legal Merchant of Record, handling international VAT, US sales taxes, and EU digital invoicing automatically.
- **Global Acceptance:** Supports international credit and debit cards, Apple Pay, Google Pay, and local Indian payment methods (UPI/NetBanking) seamlessly.
- **Subscription Engine:** Handles recurring monthly and annual webhooks, card retries, and dunning workflows without requiring an external billing engine.

### 3.3 Subscription Tiering

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TIER ARCHITECTURE COMPARISON                    │
├──────────────────────────┬──────────────────────┬──────────────────────┤
│ Feature                  │ Free Tier ("Observation")│ Pro ("Guardian") │
├──────────────────────────┼──────────────────────┼──────────────────────┤
│ Price                    │ $0 / month           │ $4.99/mo or $39/year │
│ Manual Test Logging      │ Unlimited entries    │ Unlimited entries    │
│ Basic 2D Graphs          │ Yes (per parameter)  │ Yes (synchronized)   │
│ Static Threshold Warnings│ Yes (Min/Max alert)  │ Yes                  │
│ TabPFN 48h Crash Predict │ 3 sample runs total  │ Unlimited continuous │
│ Coupled Chemical Radar   │ No                   │ Yes (Mg/Alk/Ca sync) │
│ Safe Dosing Rate Guard   │ No                   │ Yes (Max safe bounds)│
│ Exportable Forensic PDF  │ No                   │ Yes (For forum/vet)  │
└──────────────────────────┴──────────────────────┴──────────────────────┘
```

---

## 4. User Personas

### Persona 1: The SPS Purist (Julian, 34, Austin, Texas)
- **Tank:** 120-gallon rimless tank running two Radion XR30 lights and a 4-head dosing pump.
- **Livestock:** High-end *Acropora*, *Millepora*, and *Montipora* colonies worth roughly $5,500.
- **Pain Point:** Tests water every Saturday morning. Had an experience two years ago where a faulty dosing pump tube caused alkalinity to drop from 8.6 to 6.8 over four days, causing RTN on half his colonies.
- **Needs:** A system that looks at subtle drift across multiple parameters and calculates whether his chemical buffer is decaying before corals start sloughing tissue.

### Persona 2: The Mixed-Reef Enthusiast (Marcus, 27, Bristol, UK)
- **Tank:** 40-gallon cube with Euphyllia (Torch and Hammer corals) and Softies worth $1,800.
- **Livestock:** High-value Torch corals that are very sensitive to sudden swings in alkalinity and phosphate depletion.
- **Pain Point:** Tests using standard titration kits (Salifert and Red Sea). Often forgets what the safe daily dosing limit is, and experiences panic when a parameter reads low.
- **Needs:** Clear guidance telling him: *"Do not fix this in one afternoon. Safe adjustment requires 12 ml over 4 days."*

---

## 5. Functional Requirements (FR)

### Module A: Tank Profile & Configuration
- **FR-1.1:** System shall store tank profile data: Net Water Volume (liters or gallons), System Type (`SPS-Dominant`, `Mixed-Reef`, `LPS/Softie`, `Nano-Reef`), and Dosing Method (`Two-Part Balling`, `Kalkwasser`, `Calcium-Reactor`, `Manual Dosing`).
- **FR-1.2:** System shall allow setting target baseline ranges for each parameter based on system type.

### Module B: Telemetry & Parameter Ingestion
- **FR-2.1:** System shall accept manual inputs for 8 core water parameters:
  1. Salinity (Specific Gravity: 1.020 - 1.030, or Salinity: 30 - 40 ppt)
  2. Alkalinity (dKH: 5.0 - 14.0, or meq/L: 1.8 - 5.0)
  3. Calcium ($Ca^{2+}$: 300 - 550 ppm)
  4. Magnesium ($Mg^{2+}$: 1000 - 1600 ppm)
  5. Nitrate ($NO_3^-$: 0.0 - 100.0 ppm)
  6. Phosphate ($PO_4^{3-}$: 0.00 - 2.00 ppm)
  7. Temperature (°C: 20.0 - 32.0, or °F: 68.0 - 90.0)
  8. pH (7.4 - 8.8)
- **FR-2.2:** System shall automatically normalize all units to standard metric representation (Specific Gravity, dKH, ppm, °C) regardless of input format.
- **FR-2.3:** System shall store historical test logs with microsecond timestamps in client-side IndexedDB with cloud synchronization.

### Module C: TabPFN Predictive Crash Engine
- **FR-3.1:** System shall compile a multi-dimensional feature vector consisting of:
  - Current normalized parameters.
  - 24-hour, 48-hour, and 7-day velocity ($\Delta P / \Delta t$).
  - Derived chemical coupling indicators:
    - Magnesium-to-Calcium Ratio ($Mg:Ca$, normal baseline ~ $3.1:1$).
    - Ionic Product of Calcium and Carbonate.
    - Nitrogen-to-Phosphorus Nutrient Ratio (Redfield balance).
- **FR-3.2:** System shall transmit the feature matrix to the TabPFN inference service.
- **FR-3.3:** TabPFN shall output:
  1. `Crash Probability (0.0 to 1.0)`: Likelihood of tissue necrosis or biological crash within 48 to 72 hours.
  2. `Confidence Score (0.0 to 1.0)`: Statistical confidence based on training distribution density.
  3. `Primary Vulnerability Driver`: The specific parameter or interaction causing systemic fragility (e.g., "Magnesium Buffer Exhaustion").

### Module D: Deterministic Chemical Guardrails (Fallback)
- **FR-4.1:** If TabPFN API is unreachable or network is offline, system shall automatically engage a deterministic chemical rule engine based on established marine chemical equilibrium equations.
- **FR-4.2:** System shall never fail silently; if offline, it must clearly display: *"Operating on Local Marine Chemical Guardrails."*

### Module E: Safe Remediation & Dosing Bounds
- **FR-5.1:** System shall calculate corrective dosing based on net water volume and chemical concentration formulas.
- **FR-5.2 (Biological Rate Clamp):** System shall enforce strict maximum daily change limits:
  - Alkalinity: Maximum $+0.5\text{ dKH}$ per 24 hours.
  - Calcium: Maximum $+20\text{ ppm}$ per 24 hours.
  - Magnesium: Maximum $+50\text{ ppm}$ per 24 hours.
  - Salinity: Maximum $+0.001\text{ SG}$ per 24 hours.
- **FR-5.3:** System shall calculate multi-day dosing schedules when the required correction exceeds the biological daily clamp.

### Module F: User Interface & Visual Alarms
- **FR-6.1:** System shall display the **48-Hour Biological Radar**: a high-contrast visual display showing the current equilibrium state:
  - `STABLE` (Green / Cyan, crash risk $< 15\%$)
  - `COUPLING DRIFT` (Amber, crash risk $15\% - 45\%$)
  - `IMMINENT COLLAPSE` (Red, crash risk $> 45\%$)
- **FR-6.2:** System shall display a multi-parameter synchronized timeline highlighting rate-of-change spikes.

---

## 6. Non-Functional Requirements (NFR)

- **NFR-1 (Latency):** TabPFN API prediction response time shall be under 1,500 milliseconds on standard broadband connections.
- **NFR-2 (Offline Capability):** System must allow logging and basic heuristic evaluations with zero internet connection via service workers and IndexedDB.
- **NFR-3 (Data Privacy):** Water chemistry numbers do not contain personal identifiable information. Client logs are anonymized before passing to TabPFN.
- **NFR-4 (Responsive Layout):** Interface must function smoothly on mobile browsers (Safari on iOS, Chrome on Android) as reef keepers frequently test with their phone in one hand next to the tank.

---

## 7. Edge Cases, Noise & Worst-Case Scenarios

1. **Test Kit Operator Error / Measurement Noise:**
   - Standard titration kits have a natural human reading variance of $\pm 0.3\text{ dKH}$ and $\pm 15\text{ ppm } Ca$.
   - *Mitigation:* The system applies exponential smoothing ($EWMA, \alpha = 0.65$) to avoid triggering panic alerts on single-point noise spikes.
2. **Missing Test Parameters:**
   - Keepers frequently test Alkalinity weekly, but only test Magnesium once a month.
   - *Mitigation:* Feature builder imputes missing data using last-known-value decay with an associated uncertainty penalty passed into TabPFN.
3. **The Panic Dosing Trap:**
   - A keeper tests 6.8 dKH, panics, and dumps 50 grams of baking soda into the sump. The sudden pH and alkalinity jump causes RTN faster than the low alkalinity would have.
   - *Mitigation:* The UI presents a prominent visual warning whenever a severe deficit is detected: *"DO NOT DOSE ALL AT ONCE. Fast adjustments cause rapid tissue necrosis. Follow the multi-day ramp."*
4. **False Calibration on Salinity Refractometers:**
   - Optical refractometers drift if calibrated with plain RO water instead of 35 ppt calibration fluid.
   - *Mitigation:* System cross-references specific gravity against reported electrical conductivity / TDS when available.

---

## 8. Release Scope (Hacktoberfest Week 2 Milestone)

- **Deliverable 1:** Full interactive web application built with React, Vite, and Vanilla CSS design tokens.
- **Deliverable 2:** Python backend running on Render with TabPFN-3.5 API client integration and synthetic/historical reef crash dataset.
- **Deliverable 3:** Complete automated test suite covering unit conversions, chemical equilibrium calculations, dosing clamps, and TabPFN response handling.
- **Deliverable 4:** Dodo Payments integration flow demonstrating the Pro upgrade checkout.
- **Deliverable 5:** Complete DEV.to article following the proven winner formula with empirical testing documentation, failure analysis, and architecture diagrams.
