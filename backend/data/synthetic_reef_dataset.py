from __future__ import annotations

import numpy as np
import pandas as pd
from typing import Tuple

from backend.engine.features import FEATURE_NAMES


def generate_curated_reef_dataset(
    n_samples: int = 500,
    random_seed: int = 42
) -> Tuple[pd.DataFrame, np.ndarray]:
    rng = np.random.RandomState(random_seed)
    n_crash = n_samples // 2
    n_stable = n_samples - n_crash

    rows = []
    labels = []

    # 1. GENERATE 250 STABLE TRAJECTORIES (Label = 0)
    for _ in range(n_stable):
        salinity_sg = rng.uniform(1.0245, 1.0262)
        alkalinity_dkh = rng.uniform(7.8, 9.2)
        calcium_ppm = rng.uniform(400.0, 445.0)
        magnesium_ppm = rng.uniform(1300.0, 1420.0)
        nitrate_ppm = rng.uniform(2.0, 12.0)
        phosphate_ppm = rng.uniform(0.02, 0.08)
        temperature_c = rng.uniform(24.4, 25.8)
        ph = rng.uniform(8.15, 8.35)

        alk_vel = rng.normal(0.0, 0.12)
        ca_vel = rng.normal(0.0, 3.5)
        mg_vel = rng.normal(0.0, 6.0)

        mg_ca_ratio = magnesium_ppm / calcium_ppm
        h_term = 10.0 ** (ph - 8.2)
        ipi = (calcium_ppm * alkalinity_dkh * h_term) / (420.0 * 8.5)
        redfield = nitrate_ppm / ((phosphate_ppm * 16.0) + 1e-4)
        is_starved = 0.0
        cadence_days = rng.uniform(2.0, 7.0)

        row = [
            salinity_sg, alkalinity_dkh, calcium_ppm, magnesium_ppm,
            nitrate_ppm, phosphate_ppm, temperature_c, ph,
            alk_vel, ca_vel, mg_vel,
            mg_ca_ratio, ipi, redfield, is_starved, cadence_days
        ]
        rows.append(row)
        labels.append(0)

    # 2. GENERATE 250 VALIDATED CRASH TRAJECTORIES (Label = 1)
    crash_types = ["mg_collapse", "alk_drop", "alk_spike", "nutrient_zero", "temp_spike", "salinity_drop"]

    for i in range(n_crash):
        ctype = crash_types[i % len(crash_types)]

        salinity_sg = rng.uniform(1.0245, 1.0260)
        alkalinity_dkh = rng.uniform(8.0, 9.0)
        calcium_ppm = rng.uniform(410.0, 435.0)
        magnesium_ppm = rng.uniform(1300.0, 1380.0)
        nitrate_ppm = rng.uniform(3.0, 8.0)
        phosphate_ppm = rng.uniform(0.03, 0.06)
        temperature_c = rng.uniform(24.5, 25.5)
        ph = rng.uniform(8.18, 8.30)
        alk_vel = rng.normal(0.0, 0.1)
        ca_vel = rng.normal(0.0, 3.0)
        mg_vel = rng.normal(0.0, 5.0)
        is_starved = 0.0

        if ctype == "mg_collapse":
            magnesium_ppm = rng.uniform(1050.0, 1180.0)
            calcium_ppm = rng.uniform(420.0, 460.0)
            alkalinity_dkh = rng.uniform(8.2, 9.5)
            mg_vel = rng.uniform(-40.0, -15.0)
            alk_vel = rng.uniform(-0.6, -0.2)
        elif ctype == "alk_drop":
            alkalinity_dkh = rng.uniform(5.5, 6.8)
            alk_vel = rng.uniform(-1.8, -0.75)
        elif ctype == "alk_spike":
            alkalinity_dkh = rng.uniform(10.5, 13.5)
            alk_vel = rng.uniform(0.85, 2.2)
        elif ctype == "nutrient_zero":
            phosphate_ppm = rng.uniform(0.000, 0.005)
            nitrate_ppm = rng.uniform(0.05, 0.40)
            alkalinity_dkh = rng.uniform(9.0, 11.0)
            is_starved = 1.0
        elif ctype == "temp_spike":
            temperature_c = rng.uniform(28.8, 31.5)
        elif ctype == "salinity_drop":
            salinity_sg = rng.uniform(1.018, 1.021)

        mg_ca_ratio = magnesium_ppm / max(calcium_ppm, 1.0)
        h_term = 10.0 ** (ph - 8.2)
        ipi = (calcium_ppm * alkalinity_dkh * h_term) / (420.0 * 8.5)
        redfield = nitrate_ppm / ((max(phosphate_ppm, 0.001) * 16.0) + 1e-4)
        cadence_days = rng.uniform(1.0, 10.0)

        row = [
            salinity_sg, alkalinity_dkh, calcium_ppm, magnesium_ppm,
            nitrate_ppm, phosphate_ppm, temperature_c, ph,
            alk_vel, ca_vel, mg_vel,
            mg_ca_ratio, ipi, redfield, is_starved, cadence_days
        ]
        rows.append(row)
        labels.append(1)

    df = pd.DataFrame(rows, columns=FEATURE_NAMES)
    y = np.array(labels, dtype=np.int32)

    # Shuffle dataset consistently
    indices = np.arange(len(df))
    rng.shuffle(indices)

    return df.iloc[indices].reset_index(drop=True), y[indices]
