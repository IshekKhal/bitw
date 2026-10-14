from __future__ import annotations

import pytest
from backend.engine.dosing_clamp import (
    calculate_alkalinity_dose_ml,
    calculate_calcium_dose_ml,
    calculate_magnesium_dose_ml,
    generate_remediation_plan,
    CLAMP_LIMITS
)
from backend.models import TankProfile, TestEntry


def test_stoichiometric_calculations() -> None:
    # 280L tank, need +0.5 dKH
    # mass = (0.5 * 280) / 33.33 = 4.20 g NaHCO3
    # volume = 4.20 / 0.0375 = 112.0 ml
    vol_ml = calculate_alkalinity_dose_ml(0.5, 280.0)
    assert 111.0 <= vol_ml <= 113.0

    ca_ml = calculate_calcium_dose_ml(20.0, 280.0)
    assert ca_ml > 0

    mg_ml = calculate_magnesium_dose_ml(50.0, 280.0)
    assert mg_ml > 0


def test_biological_rate_clamp_enforcement() -> None:
    # Depleted tank: Alk = 6.4 (target 8.4 -> delta 2.0 dKH)
    # Ca = 380 (target 420 -> delta 40 ppm)
    # Mg = 1200 (target 1350 -> delta 150 ppm)
    tank = TankProfile(net_volume_liters=250.0, system_type="sps_dominant")
    curr = TestEntry(
        alkalinity_dkh=6.4,
        calcium_ppm=380.0,
        magnesium_ppm=1200.0
    )

    plan = generate_remediation_plan(curr, tank)
    assert len(plan.rate_limited_schedule) >= 3

    # Assert that no consecutive day's delta exceeds biological clamps
    prev_alk = curr.alkalinity_dkh
    prev_ca = curr.calcium_ppm
    prev_mg = curr.magnesium_ppm

    for item in plan.rate_limited_schedule:
        end_day = item.expected_parameter_end_of_day
        delta_alk = end_day["alkalinity_dkh"] - prev_alk
        delta_ca = end_day["calcium_ppm"] - prev_ca
        delta_mg = end_day["magnesium_ppm"] - prev_mg

        assert delta_alk <= CLAMP_LIMITS["alkalinity_dkh"] + 1e-4, f"Alk delta {delta_alk} exceeded clamp 0.5 dKH"
        assert delta_ca <= CLAMP_LIMITS["calcium_ppm"] + 1e-4, f"Ca delta {delta_ca} exceeded clamp 20 ppm"
        assert delta_mg <= CLAMP_LIMITS["magnesium_ppm"] + 1e-4, f"Mg delta {delta_mg} exceeded clamp 50 ppm"

        prev_alk = end_day["alkalinity_dkh"]
        prev_ca = end_day["calcium_ppm"]
        prev_mg = end_day["magnesium_ppm"]


def test_magnesium_first_priority_rule() -> None:
    # When Mg is critically low, Day 1 must prioritize Mg over Alk
    tank = TankProfile(net_volume_liters=300.0, system_type="sps_dominant")
    curr = TestEntry(
        alkalinity_dkh=7.4,
        calcium_ppm=410.0,
        magnesium_ppm=1120.0
    )

    plan = generate_remediation_plan(curr, tank)
    day_1 = plan.rate_limited_schedule[0]

    assert "DO NOT DOSE ALKALINITY TODAY" in day_1.action
    assert day_1.expected_parameter_end_of_day["alkalinity_dkh"] == curr.alkalinity_dkh
    assert day_1.expected_parameter_end_of_day["magnesium_ppm"] > curr.magnesium_ppm
