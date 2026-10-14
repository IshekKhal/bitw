from __future__ import annotations

from datetime import datetime, timedelta
import math
from typing import Dict, List, Tuple
from backend.models import RemediationAction, RemediationPlan, TankProfile, TestEntry

CLAMP_LIMITS = {
    "alkalinity_dkh": 0.50,
    "calcium_ppm": 20.0,
    "magnesium_ppm": 50.0,
    "salinity_sg": 0.0010,
    "temperature_c": 1.0
}

TARGET_BASELINES: Dict[str, Dict[str, float]] = {
    "sps_dominant": {
        "alkalinity_dkh": 8.4,
        "calcium_ppm": 420.0,
        "magnesium_ppm": 1350.0,
        "salinity_sg": 1.0255,
        "temperature_c": 25.0
    },
    "mixed_reef": {
        "alkalinity_dkh": 8.6,
        "calcium_ppm": 430.0,
        "magnesium_ppm": 1350.0,
        "salinity_sg": 1.0250,
        "temperature_c": 25.0
    },
    "lps_softie": {
        "alkalinity_dkh": 9.0,
        "calcium_ppm": 420.0,
        "magnesium_ppm": 1320.0,
        "salinity_sg": 1.0250,
        "temperature_c": 25.0
    },
    "nano_reef": {
        "alkalinity_dkh": 8.2,
        "calcium_ppm": 415.0,
        "magnesium_ppm": 1320.0,
        "salinity_sg": 1.0250,
        "temperature_c": 25.0
    }
}


def calculate_alkalinity_dose_ml(delta_dkh: float, volume_liters: float) -> float:
    if delta_dkh <= 0:
        return 0.0
    mass_grams = (delta_dkh * volume_liters) / 33.33
    volume_ml = mass_grams / 0.0375
    return round(volume_ml, 1)


def calculate_calcium_dose_ml(delta_ca_ppm: float, volume_liters: float) -> float:
    if delta_ca_ppm <= 0:
        return 0.0
    mass_grams = (delta_ca_ppm * volume_liters) / 272.0
    volume_ml = mass_grams / 0.0750
    return round(volume_ml, 1)


def calculate_magnesium_dose_ml(delta_mg_ppm: float, volume_liters: float) -> float:
    if delta_mg_ppm <= 0:
        return 0.0
    mass_grams = (delta_mg_ppm * volume_liters) / 120.0
    volume_ml = mass_grams / 0.1000
    return round(volume_ml, 1)


def generate_remediation_plan(
    current: TestEntry,
    tank_profile: TankProfile
) -> RemediationPlan:
    targets = TARGET_BASELINES.get(tank_profile.system_type, TARGET_BASELINES["sps_dominant"])
    vol = tank_profile.net_volume_liters

    delta_alk = max(0.0, targets["alkalinity_dkh"] - current.alkalinity_dkh)
    delta_ca = max(0.0, targets["calcium_ppm"] - current.calcium_ppm)
    delta_mg = max(0.0, targets["magnesium_ppm"] - current.magnesium_ppm)

    days_alk = math.ceil(delta_alk / CLAMP_LIMITS["alkalinity_dkh"]) if delta_alk > 0 else 1
    days_ca = math.ceil(delta_ca / CLAMP_LIMITS["calcium_ppm"]) if delta_ca > 0 else 1
    days_mg = math.ceil(delta_mg / CLAMP_LIMITS["magnesium_ppm"]) if delta_mg > 0 else 1

    total_days = max(days_alk, days_ca, days_mg, 1)
    mg_shield_compromised = (current.magnesium_ppm < 1250.0) or ((current.magnesium_ppm / max(current.calcium_ppm, 1.0)) < 2.85)

    schedule: List[RemediationAction] = []
    base_date = current.timestamp

    running_alk = current.alkalinity_dkh
    running_ca = current.calcium_ppm
    running_mg = current.magnesium_ppm

    rem_alk = delta_alk
    rem_ca = delta_ca
    rem_mg = delta_mg

    for day_num in range(1, total_days + 1):
        step_date = (base_date + timedelta(days=day_num - 1)).strftime("%Y-%m-%d")

        if day_num == 1 and mg_shield_compromised and rem_mg > 0:
            step_mg = min(CLAMP_LIMITS["magnesium_ppm"], rem_mg)
            rem_mg -= step_mg
            running_mg += step_mg
            mg_ml = calculate_magnesium_dose_ml(step_mg, vol)

            action_desc = "Dose Magnesium only. DO NOT DOSE ALKALINITY TODAY."
            chem_name = "Magnesium Chloride / Sulfate standard solution"
            reason = "Restoring magnesium above 1250 ppm poisons abiotic calcite crystal nucleation sites, halting spontaneous calcium carbonate precipitation."
            total_ml = mg_ml
        else:
            step_mg = min(CLAMP_LIMITS["magnesium_ppm"], rem_mg) if rem_mg > 0 else 0.0
            step_alk = min(CLAMP_LIMITS["alkalinity_dkh"], rem_alk) if rem_alk > 0 else 0.0
            step_ca = min(CLAMP_LIMITS["calcium_ppm"], rem_ca) if rem_ca > 0 else 0.0

            rem_mg -= step_mg
            rem_alk -= step_alk
            rem_ca -= step_ca

            running_mg += step_mg
            running_alk += step_alk
            running_ca += step_ca

            mg_ml = calculate_magnesium_dose_ml(step_mg, vol)
            alk_ml = calculate_alkalinity_dose_ml(step_alk, vol)
            ca_ml = calculate_calcium_dose_ml(step_ca, vol)

            actions = []
            chems = []
            if mg_ml > 0:
                actions.append(f"Mg: +{step_mg:.0f} ppm ({mg_ml} ml)")
                chems.append(f"Magnesium Solution ({mg_ml} ml)")
            if alk_ml > 0:
                actions.append(f"Alk: +{step_alk:.2f} dKH ({alk_ml} ml)")
                chems.append(f"Sodium Bicarbonate ({alk_ml} ml)")
            if ca_ml > 0:
                actions.append(f"Ca: +{step_ca:.0f} ppm ({ca_ml} ml)")
                chems.append(f"Calcium Chloride ({ca_ml} ml)")

            total_ml = round(mg_ml + alk_ml + ca_ml, 1)

            if not actions:
                action_desc = "Maintain current dosing schedule. System parameters within target range."
                chem_name = "None required"
                reason = "Chemical equilibrium is balanced. No acute biological intervention needed."
            else:
                action_desc = "Staggered dosage: " + ", ".join(actions)
                chem_name = " + ".join(chems)
                reason = f"Enforcing safe daily clamps (max +{CLAMP_LIMITS['alkalinity_dkh']} dKH/24h) to avoid osmotic cellular shock and rapid tissue detachment."

        schedule.append(
            RemediationAction(
                day=day_num,
                date=step_date,
                action=action_desc,
                chemical=chem_name,
                amount_ml=total_ml,
                expected_parameter_end_of_day={
                    "alkalinity_dkh": round(running_alk, 2),
                    "calcium_ppm": round(running_ca, 1),
                    "magnesium_ppm": round(running_mg, 1)
                },
                reasoning=reason
            )
        )

    return RemediationPlan(
        target_parameters={
            "alkalinity_dkh": targets["alkalinity_dkh"],
            "calcium_ppm": targets["calcium_ppm"],
            "magnesium_ppm": targets["magnesium_ppm"],
            "salinity_sg": targets["salinity_sg"],
            "temperature_c": targets["temperature_c"]
        },
        rate_limited_schedule=schedule
    )
