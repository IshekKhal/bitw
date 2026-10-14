from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Tuple
import numpy as np

from backend.models import ChemicalIndicators, TestEntry

FEATURE_NAMES = [
    "salinity_sg",
    "alkalinity_dkh",
    "calcium_ppm",
    "magnesium_ppm",
    "nitrate_ppm",
    "phosphate_ppm",
    "temperature_c",
    "ph",
    "alk_velocity_24h",
    "ca_velocity_24h",
    "mg_velocity_24h",
    "mg_ca_ratio",
    "ionic_product_index",
    "redfield_nutrient_ratio",
    "nutrient_starvation_flag",
    "testing_cadence_days"
]


def apply_ewma_smoothing(entries: List[TestEntry], alpha: float = 0.70) -> TestEntry:
    if not entries:
        raise ValueError("Cannot smooth empty entries list.")

    sorted_entries = sorted(entries, key=lambda e: e.timestamp)
    smoothed = sorted_entries[0].model_copy()

    for next_entry in sorted_entries[1:]:
        smoothed.salinity_sg = alpha * next_entry.salinity_sg + (1 - alpha) * smoothed.salinity_sg
        smoothed.alkalinity_dkh = alpha * next_entry.alkalinity_dkh + (1 - alpha) * smoothed.alkalinity_dkh
        smoothed.calcium_ppm = alpha * next_entry.calcium_ppm + (1 - alpha) * smoothed.calcium_ppm
        smoothed.magnesium_ppm = alpha * next_entry.magnesium_ppm + (1 - alpha) * smoothed.magnesium_ppm
        smoothed.nitrate_ppm = alpha * next_entry.nitrate_ppm + (1 - alpha) * smoothed.nitrate_ppm
        smoothed.phosphate_ppm = alpha * next_entry.phosphate_ppm + (1 - alpha) * smoothed.phosphate_ppm
        smoothed.temperature_c = alpha * next_entry.temperature_c + (1 - alpha) * smoothed.temperature_c
        smoothed.ph = alpha * next_entry.ph + (1 - alpha) * smoothed.ph
        smoothed.timestamp = next_entry.timestamp

    return smoothed


def calculate_velocities(
    current: TestEntry,
    prior: TestEntry | None
) -> Tuple[float, float, float, float]:
    if prior is None:
        return 0.0, 0.0, 0.0, 7.0

    delta_seconds = max((current.timestamp - prior.timestamp).total_seconds(), 3600.0)
    delta_days = delta_seconds / 86400.0

    alk_vel = (current.alkalinity_dkh - prior.alkalinity_dkh) / delta_days
    ca_vel = (current.calcium_ppm - prior.calcium_ppm) / delta_days
    mg_vel = (current.magnesium_ppm - prior.magnesium_ppm) / delta_days

    return round(alk_vel, 3), round(ca_vel, 2), round(mg_vel, 2), round(delta_days, 2)


def calculate_chemical_indicators(
    current: TestEntry,
    alk_velocity_24h: float,
    ca_velocity_24h: float,
    mg_velocity_24h: float
) -> ChemicalIndicators:
    ca_safe = max(current.calcium_ppm, 50.0)
    mg_ca_ratio = round(current.magnesium_ppm / ca_safe, 3)

    if mg_ca_ratio < 2.85:
        mg_ca_status = "CRITICALLY LOW (Shield Broken)"
    elif mg_ca_ratio < 3.05:
        mg_ca_status = "BORDERLINE DEFICIENT"
    elif mg_ca_ratio > 3.45:
        mg_ca_status = "ELEVATED MAGNESIUM"
    else:
        mg_ca_status = "BALANCED (Nominal ~3.20)"

    h_term = 10.0 ** (current.ph - 8.2)
    numerator = current.calcium_ppm * current.alkalinity_dkh * h_term
    denominator = 420.0 * 8.5 * 1.0
    ionic_product = round(numerator / denominator, 3)

    aragonite_proxy = round(
        (current.calcium_ppm / 420.0) * (current.alkalinity_dkh / 8.5) * (10.0 ** (current.ph - 8.2)),
        3
    )

    po4_effective = max(current.phosphate_ppm, 0.001)
    redfield_ratio = round(current.nitrate_ppm / ((po4_effective * 16.0) + 1e-4), 2)

    is_starved = 1 if (current.phosphate_ppm < 0.01 and current.alkalinity_dkh > 8.5) else 0

    return ChemicalIndicators(
        mg_ca_ratio=mg_ca_ratio,
        mg_ca_status=mg_ca_status,
        alk_velocity_24h=alk_velocity_24h,
        ca_velocity_24h=ca_velocity_24h,
        mg_velocity_24h=mg_velocity_24h,
        ionic_product_index=ionic_product,
        aragonite_saturation_proxy=aragonite_proxy,
        redfield_nutrient_ratio=redfield_ratio,
        nutrient_starvation_flag=is_starved
    )


def build_feature_vector(
    current: TestEntry,
    history: List[TestEntry] | None = None
) -> Tuple[np.ndarray, ChemicalIndicators]:
    prior_entry = None
    if history and len(history) > 0:
        smoothed_history = apply_ewma_smoothing(history, alpha=0.70)
        prior_entry = smoothed_history

    alk_vel, ca_vel, mg_vel, cadence_days = calculate_velocities(current, prior_entry)
    indicators = calculate_chemical_indicators(current, alk_vel, ca_vel, mg_vel)

    features = [
        current.salinity_sg,
        current.alkalinity_dkh,
        current.calcium_ppm,
        current.magnesium_ppm,
        current.nitrate_ppm,
        current.phosphate_ppm,
        current.temperature_c,
        current.ph,
        indicators.alk_velocity_24h,
        indicators.ca_velocity_24h,
        indicators.mg_velocity_24h,
        indicators.mg_ca_ratio,
        indicators.ionic_product_index,
        indicators.redfield_nutrient_ratio,
        float(indicators.nutrient_starvation_flag),
        cadence_days
    ]

    return np.array(features, dtype=np.float32), indicators
