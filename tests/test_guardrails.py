from __future__ import annotations

import pytest
from backend.engine.features import calculate_chemical_indicators
from backend.engine.guardrails import evaluate_deterministic_guardrails
from backend.models import TankProfile, TestEntry


def test_guardrails_stable_reef() -> None:
    curr = TestEntry(
        salinity_sg=1.0255,
        alkalinity_dkh=8.4,
        calcium_ppm=425.0,
        magnesium_ppm=1360.0,
        nitrate_ppm=5.0,
        phosphate_ppm=0.04,
        temperature_c=25.0,
        ph=8.25
    )
    indicators = calculate_chemical_indicators(curr, 0.05, 1.0, 2.0)
    profile = TankProfile(system_type="sps_dominant")

    assessment = evaluate_deterministic_guardrails(curr, indicators, profile)
    assert assessment.risk_level == "STABLE"
    assert assessment.crash_probability_48h <= 0.15


def test_guardrails_magnesium_collapse() -> None:
    curr = TestEntry(
        salinity_sg=1.025,
        alkalinity_dkh=8.4,
        calcium_ppm=430.0,
        magnesium_ppm=1120.0,  # Critically low!
        nitrate_ppm=4.0,
        phosphate_ppm=0.03,
        temperature_c=25.0,
        ph=8.25
    )
    indicators = calculate_chemical_indicators(curr, -0.2, -5.0, -30.0)
    profile = TankProfile(system_type="sps_dominant")

    assessment = evaluate_deterministic_guardrails(curr, indicators, profile)
    assert assessment.risk_level == "IMMINENT_COLLAPSE"
    assert assessment.crash_probability_48h >= 0.70
    assert "Magnesium" in assessment.primary_driver


def test_guardrails_alkalinity_shock() -> None:
    curr = TestEntry(
        alkalinity_dkh=6.8,
        calcium_ppm=420.0,
        magnesium_ppm=1350.0
    )
    # Severe drop of -1.1 dKH in 24h
    indicators = calculate_chemical_indicators(curr, -1.1, -10.0, -5.0)
    profile = TankProfile(system_type="sps_dominant")

    assessment = evaluate_deterministic_guardrails(curr, indicators, profile)
    assert assessment.risk_level == "IMMINENT_COLLAPSE"
    assert "Alkalinity Shock" in assessment.primary_driver or "Depletion" in assessment.primary_driver
