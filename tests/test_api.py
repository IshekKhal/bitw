from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "engine_mode" in data


def test_get_presets() -> None:
    response = client.get("/api/presets")
    assert response.status_code == 200
    presets = response.json()
    assert len(presets) >= 4
    preset_ids = [p["id"] for p in presets]
    assert "preset_stable_sps" in preset_ids
    assert "preset_mg_collapse" in preset_ids


def test_predict_endpoint_stable() -> None:
    payload = {
        "tank_profile": {
            "tank_id": "test_tank_01",
            "net_volume_liters": 300.0,
            "system_type": "sps_dominant",
            "dosing_method": "two_part_balling"
        },
        "current_test": {
            "salinity_sg": 1.0255,
            "alkalinity_dkh": 8.4,
            "calcium_ppm": 420.0,
            "magnesium_ppm": 1350.0,
            "nitrate_ppm": 5.0,
            "phosphate_ppm": 0.04,
            "temperature_c": 25.0,
            "ph": 8.25
        },
        "history": []
    }

    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["status"] in ["success", "fallback_engaged"]
    assert "risk_assessment" in res
    assert res["risk_assessment"]["risk_level"] == "STABLE"
    assert "chemical_indicators" in res
    assert "remediation_plan" in res


def test_predict_endpoint_mg_collapse() -> None:
    payload = {
        "tank_profile": {
            "tank_id": "test_tank_02",
            "net_volume_liters": 250.0,
            "system_type": "sps_dominant"
        },
        "current_test": {
            "salinity_sg": 1.025,
            "alkalinity_dkh": 8.0,
            "calcium_ppm": 430.0,
            "magnesium_ppm": 1130.0,
            "nitrate_ppm": 4.0,
            "phosphate_ppm": 0.03,
            "temperature_c": 25.0,
            "ph": 8.25
        },
        "history": []
    }

    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["risk_assessment"]["risk_level"] == "IMMINENT_COLLAPSE"
    assert res["risk_assessment"]["crash_probability_48h"] >= 0.70


def test_billing_checkout_and_status() -> None:
    # 1. Create Checkout Session
    checkout_payload = {
        "customer_email": "test_keeper@reeftank.net",
        "customer_name": "Julian Miller",
        "billing_cycle": "monthly"
    }
    response = client.post("/api/billing/create-checkout-session", json=checkout_payload)
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert "checkout_url" in data

    # 2. Check User Status
    status_response = client.get("/api/user/status?email=test_keeper@reeftank.net")
    assert status_response.status_code == 200
    user_status = status_response.json()
    assert user_status["user_id"] == "test_keeper@reeftank.net"
    assert "is_pro" in user_status
