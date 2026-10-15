from __future__ import annotations

from typing import List, Tuple
from backend.models import ChemicalIndicators, RiskAssessment, TankProfile, TestEntry


def evaluate_deterministic_guardrails(
    current: TestEntry,
    indicators: ChemicalIndicators,
    tank_profile: TankProfile
) -> RiskAssessment:
    crash_prob = 0.05
    risk_level = "STABLE"
    primary_driver = "All parameters within normal biological equilibrium bounds"
    secondary_driver = None

    critical_drivers: List[Tuple[float, str]] = []

    # 1. Abiotic precipitation hazard (Magnesium shield collapse)
    if indicators.mg_ca_ratio < 2.85 or (current.magnesium_ppm < 1200.0 and current.alkalinity_dkh > 8.0):
        risk = 0.88 if indicators.mg_ca_ratio < 2.70 else 0.79
        critical_drivers.append((
            risk,
            f"Magnesium Shield Depleted: Magnesium ratio is {indicators.mg_ca_ratio:.2f} (safe is ~3.20). Calcium and buffer will bind together and precipitate out of solution like snow, starving corals of building blocks."
        ))

    # 2. Alkalinity velocity shock
    if abs(indicators.alk_velocity_24h) >= 0.80:
        direction = "dropped" if indicators.alk_velocity_24h < 0 else "jumped"
        critical_drivers.append((
            0.92,
            f"Alkalinity Shock: Alkalinity {direction} {indicators.alk_velocity_24h:+.2f} dKH in 24h. Corals cannot adapt to sudden swings—tissue will peel off (RTN) within 48 hours unless stabilized."
        ))
    elif abs(indicators.alk_velocity_24h) >= 0.45:
        critical_drivers.append((
            0.55,
            f"Alkalinity Drifting Too Fast: Changing at {indicators.alk_velocity_24h:+.2f} dKH/day. Safe daily limit is ±0.5 dKH to avoid coral stress."
        ))

    # 3. Absolute alkalinity limits
    if current.alkalinity_dkh < 6.5:
        critical_drivers.append((
            0.85,
            f"Severe Alkalinity Depletion: Carbonate buffer dropped to {current.alkalinity_dkh:.1f} dKH. Corals have stopped building skeleton and tissue will recede from the base."
        ))
    elif current.alkalinity_dkh > 11.5:
        critical_drivers.append((
            0.75,
            f"Alkalinity Dangerously High: Buffer reached {current.alkalinity_dkh:.1f} dKH. High alkalinity with intense lighting burns tips and causes chemical precipitation."
        ))

    # 4. Nutrient starvation vs elevated alkalinity
    if indicators.nutrient_starvation_flag == 1 or (current.phosphate_ppm < 0.01 and current.alkalinity_dkh > 8.5):
        critical_drivers.append((
            0.68,
            f"Phosphate Starvation & Burnt Tips: Phosphate dropped to zero ({current.phosphate_ppm:.3f} ppm) while alkalinity is high ({current.alkalinity_dkh:.1f} dKH). Corals starve under lights and burn tips within 48h."
        ))

    # 5. Temperature and salinity extremes
    if current.temperature_c > 28.5:
        critical_drivers.append((
            0.82,
            f"Water Too Warm ({current.temperature_c:.1f} °C / {(current.temperature_c * 9/5 + 32):.1f} °F): Corals will expel their symbiotic algae and turn white (bleach) if heat persists."
        ))
    elif current.temperature_c < 22.0:
        critical_drivers.append((
            0.70,
            f"Water Too Cold ({current.temperature_c:.1f} °C): Low temperatures shut down coral metabolism and growth."
        ))

    if current.salinity_sg < 1.022:
        critical_drivers.append((
            0.78,
            f"Salinity Too Low ({current.salinity_sg:.4f} SG): Water is too fresh, causing osmotic pressure that swells and bursts coral cells."
        ))
    elif current.salinity_sg > 1.028:
        critical_drivers.append((
            0.72,
            f"Salinity Too High ({current.salinity_sg:.4f} SG): Salt level is dehydrating coral tissue."
        ))

    # 6. Aragonite dissolution check
    if indicators.aragonite_saturation_proxy < 0.65 or current.ph < 7.80:
        critical_drivers.append((
            0.80,
            f"Acidic Water Dissolving Skeletons: Low pH ({current.ph:.2f}) makes water corrosive, actively dissolving coral calcium skeletons."
        ))

    if critical_drivers:
        critical_drivers.sort(key=lambda x: x[0], reverse=True)
        top_risk, top_driver = critical_drivers[0]
        crash_prob = round(top_risk, 2)
        primary_driver = top_driver

        if len(critical_drivers) > 1:
            secondary_driver = critical_drivers[1][1]
        elif abs(indicators.alk_velocity_24h) > 0.2:
            secondary_driver = f"Secondary drift: Alk velocity {indicators.alk_velocity_24h:+.2f} dKH/24h"

        if crash_prob >= 0.45:
            risk_level = "IMMINENT_COLLAPSE"
        else:
            risk_level = "COUPLING_DRIFT"
    else:
        # Check mild drift
        if indicators.mg_ca_ratio < 3.05:
            crash_prob = 0.28
            risk_level = "COUPLING_DRIFT"
            primary_driver = f"Mild Magnesium Drift: Ratio {indicators.mg_ca_ratio:.2f} is approaching critical precipitation threshold (2.85)."
        elif abs(indicators.alk_velocity_24h) >= 0.25:
            crash_prob = 0.22
            risk_level = "COUPLING_DRIFT"
            primary_driver = f"Moderate Alkalinity Drift: {indicators.alk_velocity_24h:+.2f} dKH/24h."
        else:
            crash_prob = 0.06
            risk_level = "STABLE"

    confidence_score = 0.95

    return RiskAssessment(
        crash_probability_48h=crash_prob,
        risk_level=risk_level,
        confidence_score=confidence_score,
        primary_driver=primary_driver,
        secondary_driver=secondary_driver
    )
