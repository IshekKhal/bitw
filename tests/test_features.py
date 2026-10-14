from __future__ import annotations

from datetime import datetime, timedelta, timezone
import numpy as np
import pytest

from backend.engine.features import (
    apply_ewma_smoothing,
    build_feature_vector,
    calculate_chemical_indicators,
    calculate_velocities,
    FEATURE_NAMES
)
from backend.models import TestEntry


def test_calculate_velocities() -> None:
    now = datetime.now(timezone.utc)
    t_prev = now - timedelta(days=2)

    entry_curr = TestEntry(
        timestamp=now,
        salinity_sg=1.025,
        alkalinity_dkh=7.6,
        calcium_ppm=410.0,
        magnesium_ppm=1200.0,
        nitrate_ppm=5.0,
        phosphate_ppm=0.04,
        temperature_c=25.0,
        ph=8.2
    )

    entry_prev = TestEntry(
        timestamp=t_prev,
        salinity_sg=1.025,
        alkalinity_dkh=8.6,
        calcium_ppm=420.0,
        magnesium_ppm=1250.0,
        nitrate_ppm=5.0,
        phosphate_ppm=0.04,
        temperature_c=25.0,
        ph=8.2
    )

    alk_vel, ca_vel, mg_vel, cadence = calculate_velocities(entry_curr, entry_prev)
    # Drift is -1.0 dKH over 2 days = -0.5 dKH/24h
    assert alk_vel == -0.5
    assert ca_vel == -5.0
    assert mg_vel == -25.0
    assert cadence == 2.0


def test_calculate_chemical_indicators() -> None:
    entry = TestEntry(
        salinity_sg=1.025,
        alkalinity_dkh=8.4,
        calcium_ppm=420.0,
        magnesium_ppm=1150.0,
        nitrate_ppm=4.0,
        phosphate_ppm=0.04,
        temperature_c=25.0,
        ph=8.2
    )

    indicators = calculate_chemical_indicators(entry, -0.3, -5.0, -20.0)
    assert indicators.mg_ca_ratio == round(1150.0 / 420.0, 3)
    assert "CRITICALLY LOW" in indicators.mg_ca_status
    assert indicators.nutrient_starvation_flag == 0


def test_build_feature_vector_dimensions() -> None:
    entry = TestEntry()
    vec, indicators = build_feature_vector(entry)

    assert len(vec) == 16
    assert len(FEATURE_NAMES) == 16
    assert isinstance(vec, np.ndarray)
    assert vec[0] == pytest.approx(entry.salinity_sg)
    assert vec[1] == pytest.approx(entry.alkalinity_dkh)
    assert vec[2] == pytest.approx(entry.calcium_ppm)
    assert vec[3] == pytest.approx(entry.magnesium_ppm)
