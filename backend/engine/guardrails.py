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
            f"Magnesium Shield Collapse: Mg:Ca ratio {indicators.mg_ca_ratio:.2f} (baseline ~3.20) induces abiotic calcium carbonate crystal nucleation."
        ))

    # 2. Alkalinity velocity shock
    if abs(indicators.alk_velocity_24h) >= 0.80:
        direction = "drop" if indicators.alk_velocity_24h < 0 else "spike"
        critical_drivers.append((
            0.92,
            f"Alkalinity Shock: 24h drift of {indicators.alk_velocity_24h:+.2f} dKH triggers osmotic cell rupture and Rapid Tissue Necrosis (RTN)."
        ))
    elif abs(indicators.alk_velocity_24h) >= 0.45:
        critical_drivers.append((
            0.55,
            f"Elevated Alkalinity Velocity: {indicators.alk_velocity_24h:+.2f} dKH/24h exceeds biological buffer tolerance (+0.5 dKH clamp)."
        ))

    # 3. Absolute alkalinity limits
    if current.alkalinity_dkh < 6.5:
        critical_drivers.append((
            0.85,
            f"Severe Alkalinity Depletion: {current.alkalinity_dkh:.1f} dKH starves coral proton pumps, halting aragonite crystallization."
        ))
    elif current.alkalinity_dkh > 11.5:
        critical_drivers.append((
            0.75,
            f"Hyper-Carbonate Stress: {current.alkalinity_dkh:.1f} dKH risks chemical precipitation and base recession."
        ))

    # 4. Nutrient starvation vs elevated alkalinity
    if indicators.nutrient_starvation_flag == 1 or (current.phosphate_ppm < 0.01 and current.alkalinity_dkh > 8.5):
        critical_drivers.append((
            0.68,
            f"Nutrient Bottom-Out: Zero phosphate ({current.phosphate_ppm:.3f} ppm) at {current.alkalinity_dkh:.1f} dKH induces burnt tip oxidative necrosis."
        ))

    # 5. Temperature and salinity extremes
    if current.temperature_c > 28.5:
        critical_drivers.append((
            0.82,
            f"Thermal Stress: Temperature {current.temperature_c:.1f} °C initiates symbiotic zooxanthellae photo-inhibition and coral bleaching."
        ))
    elif current.temperature_c < 22.0:
        critical_drivers.append((
            0.70,
            f"Hypothermic Shock: Water temperature {current.temperature_c:.1f} °C shuts down enzyme and calcification kinetics."
        ))

    if current.salinity_sg < 1.022:
        critical_drivers.append((
            0.78,
            f"Hypo-Salinity Stress: Specific gravity {current.salinity_sg:.4f} causes extreme cellular osmotic swelling."
        ))
    elif current.salinity_sg > 1.028:
        critical_drivers.append((
            0.72,
            f"Hyper-Salinity Stress: Specific gravity {current.salinity_sg:.4f} dehydrates coral polyp tissues."
        ))

    # 6. Aragonite dissolution check
    if indicators.aragonite_saturation_proxy < 0.65 or current.ph < 7.80:
        critical_drivers.append((
            0.80,
            f"Aragonite Skeletal Dissolution: Low pH ({current.ph:.2f}) actively dissolves existing coral calcium carbonate skeletons."
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
