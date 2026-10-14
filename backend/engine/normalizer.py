from __future__ import annotations

from datetime import datetime, timezone
from backend.models import RawInputEntry, TestEntry


def normalize_salinity(value: float, unit: str = "sg") -> float:
    normalized_unit = unit.lower().strip()
    if normalized_unit == "ppt":
        return round(1.0 + (value * 0.0008), 4)
    return round(float(value), 4)


def normalize_alkalinity(value: float, unit: str = "dkh") -> float:
    normalized_unit = unit.lower().strip()
    if normalized_unit == "meq_l" or normalized_unit == "meq/l":
        return round(value * 2.804, 2)
    if normalized_unit == "ppm":
        return round(value / 17.86, 2)
    return round(float(value), 2)


def normalize_temperature(value: float, unit: str = "c") -> float:
    normalized_unit = unit.lower().strip()
    if normalized_unit == "f":
        return round((value - 32.0) / 1.8, 2)
    return round(float(value), 2)


def normalize_raw_entry(raw: RawInputEntry) -> TestEntry:
    timestamp = raw.timestamp or datetime.now(timezone.utc)
    salinity_sg = normalize_salinity(raw.salinity_value, raw.salinity_unit)
    alkalinity_dkh = normalize_alkalinity(raw.alkalinity_value, raw.alkalinity_unit)
    temperature_c = normalize_temperature(raw.temperature_value, raw.temperature_unit)

    return TestEntry(
        timestamp=timestamp,
        salinity_sg=salinity_sg,
        alkalinity_dkh=alkalinity_dkh,
        calcium_ppm=round(float(raw.calcium_ppm), 1),
        magnesium_ppm=round(float(raw.magnesium_ppm), 1),
        nitrate_ppm=round(float(raw.nitrate_ppm), 2),
        phosphate_ppm=round(float(raw.phosphate_ppm), 3),
        temperature_c=temperature_c,
        ph=round(float(raw.ph), 2)
    )
