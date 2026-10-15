from __future__ import annotations

from typing import List, Tuple
from backend.models import ChemicalIndicators, RiskAssessment, TankProfile, TestEntry


def evaluate_deterministic_guardrails(
    current: TestEntry,
    indicators: ChemicalIndicators,
    tank_profile: TankProfile
) -> RiskAssessment:
    system_type = tank_profile.system_type if tank_profile and tank_profile.system_type else "sps_dominant"

    # Ecosystem-specific biological sensitivities
    if system_type == "sps_dominant":
        alk_shock_limit = 0.60         # Acropora tissue RTN threshold
        alk_drift_limit = 0.35
        alk_label = "SPS Acropora Vulnerability: Acropora tissue cannot tolerate rapid carbonate shifts"
        po4_starve_alk_thresh = 8.20
        po4_starve_min = 0.015
        salinity_low = 1.0235
        salinity_high = 1.0275
    elif system_type == "lps_softie":
        alk_shock_limit = 1.05         # Fleshy corals tolerate wide swings
        alk_drift_limit = 0.65
        alk_label = "LPS & Softie Resilience: Fleshy corals tolerate moderate shifts"
        po4_starve_alk_thresh = 9.50   # Soft corals thrive in higher nutrients
        po4_starve_min = 0.005
        salinity_low = 1.0210
        salinity_high = 1.0285
    elif system_type == "nano_reef":
        alk_shock_limit = 0.70
        alk_drift_limit = 0.40
        alk_label = "Nano Reef Hazard: Low water volume amplifies chemical oscillations"
        po4_starve_alk_thresh = 8.40
        po4_starve_min = 0.010
        salinity_low = 1.0235          # Evaporation risk is high in nanos
        salinity_high = 1.0270
    else:  # mixed_reef
        alk_shock_limit = 0.80
        alk_drift_limit = 0.45
        alk_label = "Mixed Reef Equilibrium"
        po4_starve_alk_thresh = 8.50
        po4_starve_min = 0.010
        salinity_low = 1.0220
        salinity_high = 1.0280

    crash_prob = 0.05
    risk_level = "STABLE"
    primary_driver = f"All parameters within safe bounds for {system_type.replace('_', ' ').title()} ecosystem"
    secondary_driver = None

    critical_drivers: List[Tuple[float, str]] = []

    # 1. Abiotic precipitation hazard (Magnesium shield collapse)
    if indicators.mg_ca_ratio < 2.85 or (current.magnesium_ppm < 1200.0 and current.alkalinity_dkh > 8.0):
        risk = 0.88 if indicators.mg_ca_ratio < 2.70 else 0.79
        critical_drivers.append((
            risk,
            f"Magnesium Shield Depleted: Magnesium ratio is {indicators.mg_ca_ratio:.2f} (safe is ~3.20). Calcium and buffer will bind together and precipitate out of solution like snow, starving corals of building blocks."
        ))

    # 2. Alkalinity velocity shock (ecosystem-dependent)
    abs_alk_vel = abs(indicators.alk_velocity_24h)
    if abs_alk_vel >= alk_shock_limit:
        direction = "dropped" if indicators.alk_velocity_24h < 0 else "jumped"
        critical_drivers.append((
            0.92,
            f"Alkalinity Shock: Alkalinity {direction} {indicators.alk_velocity_24h:+.2f} dKH in 24h. {alk_label}—tissue will peel off (RTN) within 48 hours unless stabilized."
        ))
    elif abs_alk_vel >= alk_drift_limit:
        risk_val = 0.55 if system_type in ("sps_dominant", "nano_reef") else 0.42
        critical_drivers.append((
            risk_val,
            f"Alkalinity Drifting Too Fast: Changing at {indicators.alk_velocity_24h:+.2f} dKH/day ({system_type.replace('_', ' ').title()} safe limit is ±{alk_drift_limit} dKH)."
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

    # 4. Nutrient starvation vs elevated alkalinity (bypassed for softies)
    if system_type != "lps_softie":
        if indicators.nutrient_starvation_flag == 1 or (current.phosphate_ppm < po4_starve_min and current.alkalinity_dkh > po4_starve_alk_thresh):
            critical_drivers.append((
                0.68,
                f"Phosphate Starvation & Burnt Tips: Phosphate dropped to {current.phosphate_ppm:.3f} ppm while alkalinity is elevated ({current.alkalinity_dkh:.1f} dKH). Corals starve under lights and burn tips within 48h."
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

    if current.salinity_sg < salinity_low:
        critical_drivers.append((
            0.78,
            f"Salinity Too Low ({current.salinity_sg:.4f} SG): Water is too fresh for {system_type.replace('_', ' ')} ecosystem, causing osmotic cell swelling."
        ))
    elif current.salinity_sg > salinity_high:
        sal_risk = 0.75 if system_type == "nano_reef" else 0.72
        critical_drivers.append((
            sal_risk,
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
        elif abs(indicators.alk_velocity_24h) >= alk_drift_limit * 0.7:
            crash_prob = 0.22
            risk_level = "COUPLING_DRIFT"
            primary_driver = f"Moderate Alkalinity Drift: {indicators.alk_velocity_24h:+.2f} dKH/24h."
        else:
            crash_prob = 0.05
            risk_level = "STABLE"

    confidence_score = 0.95

    return RiskAssessment(
        crash_probability_48h=crash_prob,
        risk_level=risk_level,
        confidence_score=confidence_score,
        primary_driver=primary_driver,
        secondary_driver=secondary_driver
    )
