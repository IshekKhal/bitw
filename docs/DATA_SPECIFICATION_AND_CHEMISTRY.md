# Marine Chemistry, Mathematical Formulations, and TabPFN Feature Specification

**System Name:** Before It Turns White  
**Document:** Deep Marine Hydro-Chemical and Tabular Feature Specification  
**Author:** Abhishek Khanra  
**Date:** October 14, 2026  

---

## 1. Marine Water Chemistry in Baby Terms

If you take plain water and dissolve table salt ($NaCl$), you do not get ocean water. Ocean water is a living, pressurized chemical soup containing dozens of ionic compounds in delicate equilibrium.

Corals are living animals that build stone houses out of water. A coral polyp takes dissolved **Calcium ions ($Ca^{2+}$)** and dissolved **Carbonate ions ($CO_3^{2-}$)** from the water, binds them together, and crystallizes them into solid stone: **Aragonite ($CaCO_3$)**.

Here is what the primary water test parameters mean in simple terms:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   THE EIGHT CORAL REEF CHEMICAL PILLARS                │
├──────────────────┬─────────────────┬───────────────────────────────────┤
│ Parameter        │ Ideal Range     │ Baby Terms Analogy                │
├──────────────────┼─────────────────┼───────────────────────────────────┤
│ Salinity         │ 1.025 - 1.026 SG│ The Density: How salty the water  │
│                  │ (35.0 ppt)      │ is. Controls coral cell hydration.│
├──────────────────┼─────────────────┼───────────────────────────────────┤
│ Alkalinity (dKH) │ 8.0 - 9.0 dKH   │ The Bricks: The supply of         │
│                  │                 │ carbonate available to build stone│
├──────────────────┼─────────────────┼───────────────────────────────────┤
│ Calcium (Ca)     │ 400 - 440 ppm   │ The Mortar: The calcium atoms that│
│                  │                 │ bind with carbonate bricks.       │
├──────────────────┼─────────────────┼───────────────────────────────────┤
│ Magnesium (Mg)   │ 1300 - 1380 ppm │ The Shield: Keeps Calcium and     │
│                  │                 │ Carbonate from sticking together  │
│                  │                 │ before reaching the coral.        │
├──────────────────┼─────────────────┼───────────────────────────────────┤
│ Nitrate (NO3)    │ 2.0 - 10.0 ppm  │ Coral Food A: Protein fuel for the│
│                  │                 │ symbiotic algae inside coral skin.│
├──────────────────┼─────────────────┼───────────────────────────────────┤
│ Phosphate (PO4)  │ 0.03 - 0.08 ppm │ Coral Food B: Micro-nutrients. Too│
│                  │                 │ low = starve; Too high = poison.  │
├──────────────────┼─────────────────┼───────────────────────────────────┤
│ pH               │ 8.1 - 8.4       │ Acidity: If it drops below 7.8,   │
│                  │                 │ the water literally dissolves the │
│                  │                 │ coral skeleton back into liquid.  │
├──────────────────┼─────────────────┼───────────────────────────────────┤
│ Temperature      │ 24.5 - 25.5 °C  │ Metabolic Pace: Too cold slows    │
│                  │ (76 - 78 °F)    │ life; too hot triggers bleaching. │
└──────────────────┴─────────────────┴───────────────────────────────────┘
```

---

## 2. The Three Catastrophic Crash Mechanisms

Why do corals die so fast? Why does a tank look healthy on Saturday and turn completely white on Monday? 

Corals do not have immune systems that fight chemical imbalances over weeks. When the water chemistry crosses a non-linear threshold, the tissue dies in hours.

### 2.1 Crash Mechanism 1: The Magnesium Shield Collapse ("The Abiotic Snowstorm")
- **The Chemistry:** In water containing $420\text{ ppm } Ca^{2+}$ and $8.5\text{ dKH } CO_3^{2-}$, the water is actually **supersaturated**. Chemically, calcium and carbonate desperately want to bind together right in the open water and fall to the bottom as solid chalk ($CaCO_3$).
- **Why It Doesn't:** **Magnesium ($Mg^{2+}$)** is a small, highly charged ion. Whenever microscopic crystals of calcium carbonate begin to form in the water, magnesium ions jump onto the crystal surface and poison the growth sites. Magnesium acts as a chemical shield, keeping the water supersaturated so corals can absorb the ions.
- **The Crash Trigger:** If Magnesium drops below $1200\text{ ppm}$, the shield fails. Calcium and carbonate suddenly bind spontaneously in the water column. The water turns cloudy (the "snowstorm"), and Alkalinity crashes from $8.5\text{ dKH}$ to $5.5\text{ dKH}$ in 24 hours.
- **The Result:** The sudden loss of osmotic balance triggers **Rapid Tissue Necrosis (RTN)** on delicate SPS corals (*Acropora*).

### 2.2 Crash Mechanism 2: Alkalinity Shock vs. RTN
- **The Chemistry:** Coral polyps pump protons ($H^+$) out of their internal calcification fluid to raise the internal pH and force aragonite crystallization. Their cellular enzymes are calibrated to a specific external alkalinity concentration.
- **The Crash Trigger:** If a dosing pump runs out of fluid, a tube clogs, or a heater failure slows down coral calcification while dosing continues, alkalinity swings by more than **$1.0\text{ dKH}$ in 24 hours**.
- **The Result:** The osmotic gradient across the coral's outer epidermal membrane reverses. Cell walls burst. The living fluorescent tissue detaches and dissolves in ribbons into the water, exposing the white skeleton in less than 18 hours.

### 2.3 Crash Mechanism 3: The Nutrient Bottom-Out & Burnt Tip Necrosis
- **The Chemistry:** Corals house millions of microscopic photosynthetic dinoflagellates called **zooxanthellae** within their gastrodermal cells. The zooxanthellae produce sugars that feed the coral. They require trace amounts of Nitrate ($NO_3^-$) and Phosphate ($PO_4^{3-}$).
- **The Crash Trigger:** Keepers running aggressive chemical filtration (GFO - Granular Ferric Oxide, bio-pellets, or oversized protein skimmers) accidentally drive Phosphate to absolute zero ($0.000\text{ ppm}$) while Alkalinity remains high ($> 9.0\text{ dKH}$).
- **The Result:** With high alkalinity, the coral skeleton grows faster, demanding more sugar from zooxanthellae. But with zero phosphate, the zooxanthellae starve and produce toxic oxygen radicals. The growing tips of the coral burn, blacken, and undergo tissue necrosis.

---

## 3. Mathematical Formulations & Feature Engineering Pipeline

TabPFN accepts a numerical table of features. Rather than feeding raw, disconnected measurements, the feature engineering pipeline transforms raw time-series test logs into **16 biologically grounded features**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   THE 16-DIMENSIONAL FEATURE VECTOR                    │
├────┬─────────────────────────────┬─────────────────────────────────────┤
│ #  │ Feature Name                │ Formula / Mechanism                 │
├────┼─────────────────────────────┼─────────────────────────────────────┤
│ 1  │ `salinity_sg`               │ Base specific gravity (e.g. 1.0255) │
│ 2  │ `alkalinity_dkh`            │ Base alkalinity in German degrees   │
│ 3  │ `calcium_ppm`               │ Dissolved Ca2+ concentration        │
│ 4  │ `magnesium_ppm`             │ Dissolved Mg2+ concentration        │
│ 5  │ `nitrate_ppm`               │ Dissolved NO3- concentration        │
│ 6  │ `phosphate_ppm`             │ Dissolved PO4(3-) concentration     │
│ 7  │ `temperature_c`             │ Water temperature in Celsius        │
│ 8  │ `ph`                        │ Negative log of H+ activity         │
├────┼─────────────────────────────┼─────────────────────────────────────┤
│ 9  │ `alk_velocity_24h`          │ (dKH_t - dKH_t-1) / delta_days      │
│ 10 │ `ca_velocity_24h`           │ (Ca_t - Ca_t-1) / delta_days        │
│ 11 │ `mg_velocity_24h`           │ (Mg_t - Mg_t-1) / delta_days        │
├────┼─────────────────────────────┼─────────────────────────────────────┤
│ 12 │ `mg_ca_ratio`               │ [Mg2+] / [Ca2+] (Baseline: 3.20)    │
│ 13 │ `ionic_product_index`       │ [Ca2+] * [dKH] * 10^(pH - 8.2)      │
│ 14 │ `redfield_nutrient_ratio`   │ [NO3-] / (([PO4(3-)] * 16) + 1e-4)  │
│ 15 │ `nutrient_starvation_flag`  │ 1 if (PO4 < 0.01 and dKH > 8.5), 0  │
│ 16 │ `testing_cadence_days`      │ Time interval since last valid log  │
└────┴─────────────────────────────┴─────────────────────────────────────┘
```

### 3.1 Mathematical Derivations

#### A. Ionic Product Index ($IPI$)
The tendency of calcium and carbonate to precipitate or dissolve is proportional to the ionic product:
$$IPI = \frac{[Ca^{2+}] \times [CO_3^{2-}]}{\text{Standard Seawater Constant}}$$
Approximating $[CO_3^{2-}]$ from measured total alkalinity ($TA$) and $pH$:
$$[CO_3^{2-}] \approx \frac{TA \times K'_2}{[H^+] + 2K'_2} \approx dKH \times 10^{(pH - 8.2)}$$
$$IPI = \frac{[Ca^{2+}] \times dKH \times 10^{(pH - 8.2)}}{420 \times 8.5 \times 1.0}$$
- If $IPI > 1.45$ and $R_{Mg:Ca} < 2.85$: **Abiotic precipitation imminent within 36 hours.**
- If $IPI < 0.65$: **Aragonite skeletal dissolution occurring.**

#### B. Biological Rate-of-Change Velocity
Because measurements are taken at non-uniform intervals (e.g. 3 days between test A and B, 7 days between B and C), velocity is normalized to a standard 24-hour baseline:
$$\text{Velocity}_P = \frac{P(t) - P(t - \Delta t)}{\Delta t_{\text{hours}}} \times 24.0$$
Where:
- $\text{Velocity}_{dKH} < -0.5\text{ dKH/24h} \implies \text{High Risk (Rapid Consumption or Dosing Outage)}$
- $\text{Velocity}_{dKH} > +0.7\text{ dKH/24h} \implies \text{Critical Risk (Alkalinity Shock Overdose)}$

---

## 4. Operator Noise and Measurement Uncertainty

In the real world, hobbyists do not test with mass spectrometers. They use consumer test kits with inherent human and colorimetric error:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TEST KIT TOLERANCES & NOISE MODEL                    │
├────────────────────┬─────────────────────────┬─────────────────────────┤
│ Test Kit / Brand   │ Measurement Method      │ Human Error Tolerance   │
├────────────────────┼─────────────────────────┼─────────────────────────┤
│ Hanna Checker dKH  │ Optical LED Colorimeter │ ± 0.10 dKH              │
│ Salifert dKH       │ Syringe Titration Drop  │ ± 0.30 dKH              │
│ Red Sea Pro Ca     │ Titration Endpoint Drop │ ± 15 ppm                │
│ Salifert Mg        │ Multi-reagent titration │ ± 30 ppm                │
│ Hanna ULR PO4      │ Optical Photometer      │ ± 0.01 ppm              │
│ Salifert NO3       │ Visual Color Chart Match│ ± 1.5 ppm               │
│ Optical Refracto   │ Visual Light Refraction │ ± 0.001 SG (Calibration)│
└────────────────────┴─────────────────────────┴─────────────────────────┘
```

### Noise Filtering: Exponential Weighted Moving Average (EWMA)
To avoid false-positive alarms caused by a user misreading a titration drop, the pipeline applies a Kalman-inspired exponential smoothing filter before calculating velocities:
$$\hat{P}_t = \alpha \cdot P_{\text{measured}} + (1 - \alpha) \cdot \hat{P}_{t-1}$$
Where $\alpha = 0.70$.  
This preserves genuine directional momentum while dampening single-test dropper noise.

---

## 5. Prior Labs TabPFN In-Context Memory Trajectories

TabPFN-3.5 operates by comparing target feature vectors against a curated in-context memory of validated marine trajectories:

### Trajectory Archetype A: The Silent Magnesium Crash
- **Day 0:** $SG=1.025, dKH=8.5, Ca=430, Mg=1280, PO_4=0.04, NO_3=5.0, pH=8.25$ $\implies$ **Stable (0% Risk)**
- **Day 3:** $SG=1.025, dKH=8.3, Ca=425, Mg=1190, PO_4=0.04, NO_3=5.1, pH=8.28$ $\implies$ **Elevated Risk (38%)** (Mg shield thinning)
- **Day 5:** $SG=1.025, dKH=7.4, Ca=405, Mg=1140, PO_4=0.04, NO_3=5.0, pH=8.30$ $\implies$ **Critical Crash Imminent (85%)**
- **Day 7:** $SG=1.025, dKH=5.8, Ca=380, Mg=1110 \implies$ **Full RTN Tissue Sloughing (100% Collapse)**

### Trajectory Archetype B: The Controlled Recovery (The Ideal State)
- **Day 0:** Detected $Mg=1190\text{ ppm}, dKH=7.8\text{ dKH}$.
- **Remediation Injected:** Dose $+45\text{ ppm } Mg$ on Day 1; hold alkalinity steady.
- **Day 1:** $Mg=1235, dKH=7.8$.
- **Day 2:** Dose $+45\text{ ppm } Mg$ and gentle $+0.3\text{ dKH } NaHCO_3$.
- **Day 3:** $Mg=1280, dKH=8.1$.
- **Day 5:** $Mg=1325, dKH=8.4 \implies$ **Return to Stable Equilibrium (Risk $< 8\%$).**

---

## 6. Biological Remediation Formulas (Dosing Math)

When a parameter requires correction, the system uses stoichiometric mass formulas to calculate exact liquid dosing:

### 6.1 Alkalinity (Using Sodium Bicarbonate $NaHCO_3$)
$$m_{NaHCO_3} (\text{grams}) = \frac{\Delta dKH \times V_{\text{net}} (\text{Liters})}{33.33}$$
- If stock solution is standard DIY 2-Part ($37.5\text{ g } NaHCO_3$ per liter):
$$\text{Dose Volume (ml)} = \frac{m_{NaHCO_3}}{0.0375}$$
- **Rate Clamp:** $\Delta dKH \le 0.5\text{ dKH per 24 hours}$.

### 6.2 Calcium (Using Calcium Chloride Dihydrate $CaCl_2 \cdot 2H_2O$)
$$m_{CaCl_2} (\text{grams}) = \frac{\Delta Ca (\text{ppm}) \times V_{\text{net}} (\text{Liters})}{272.0}$$
- **Rate Clamp:** $\Delta Ca \le 20\text{ ppm per 24 hours}$.

### 6.3 Magnesium (Using Magnesium Chloride Hexahydrate $MgCl_2 \cdot 6H_2O$ and Magnesium Sulfate Heptahydrate $MgSO_4 \cdot 7H_2O$ in 5:3 Ratio)
$$m_{\text{Total Mg Salts}} (\text{grams}) = \frac{\Delta Mg (\text{ppm}) \times V_{\text{net}} (\text{Liters})}{120.0}$$
- **Rate Clamp:** $\Delta Mg \le 50\text{ ppm per 24 hours}$.
