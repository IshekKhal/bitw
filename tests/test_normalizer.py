from __future__ import annotations

import pytest
from backend.engine.normalizer import (
    normalize_alkalinity,
    normalize_raw_entry,
    normalize_salinity,
    normalize_temperature
)
from backend.models import RawInputEntry


def test_normalize_salinity() -> None:
    assert normalize_salinity(1.025, "sg") == 1.025
    assert normalize_salinity(35.0, "ppt") == 1.028


def test_normalize_alkalinity() -> None:
    assert normalize_alkalinity(8.4, "dkh") == 8.4
    # 3.0 meq/L * 2.804 = 8.41 dKH
    assert normalize_alkalinity(3.0, "meq_l") == 8.41
    # 150 ppm / 17.86 = 8.40 dKH
    assert normalize_alkalinity(150.0, "ppm") == 8.40


def test_normalize_temperature() -> None:
    assert normalize_temperature(25.0, "c") == 25.0
    # 77.0 F -> (77 - 32) / 1.8 = 25.0 C
    assert normalize_temperature(77.0, "f") == 25.0


def test_normalize_raw_entry() -> None:
    raw = RawInputEntry(
        salinity_value=35.0,
        salinity_unit="ppt",
        alkalinity_value=3.0,
        alkalinity_unit="meq_l",
        calcium_ppm=420.0,
        magnesium_ppm=1350.0,
        nitrate_ppm=5.0,
        phosphate_ppm=0.04,
        temperature_value=77.0,
        temperature_unit="f",
        ph=8.25
    )

    norm = normalize_raw_entry(raw)
    assert norm.salinity_sg == 1.028
    assert norm.alkalinity_dkh == 8.41
    assert norm.temperature_c == 25.0
    assert norm.calcium_ppm == 420.0
    assert norm.ph == 8.25
