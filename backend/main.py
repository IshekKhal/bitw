from __future__ import annotations

import os
from dotenv import load_dotenv
load_dotenv()

from datetime import datetime, timedelta, timezone
import logging
from typing import Any, Dict, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from backend.billing.dodo_service import billing_service
from backend.engine.dosing_clamp import generate_remediation_plan
from backend.engine.features import build_feature_vector
from backend.engine.hardware_controller import (
    HardwareControllerConfig,
    HardwareSyncResult,
    map_probes_to_raw_entry,
    poll_hardware_controller
)
from backend.engine.normalizer import normalize_raw_entry
from backend.engine.tabpfn_agent import agent_instance
from backend.models import (
    CheckoutRequest,
    CheckoutResponse,
    PredictionRequest,
    PredictionResponse,
    RawInputEntry,
    TestEntry,
    UserStatusResponse
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("before_it_turns_white.main")

app = FastAPI(
    title="Before It Turns White API",
    description="48-Hour Predictive Water Chemistry Crash Guard for Saltwater Coral Reefs",
    version="1.0.0"
)

# Enable permissive CORS for client development and production static site
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/api/health")
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "tabpfn_cloud_connected": agent_instance.is_connected,
        "engine_mode": "tabpfn-3.5-foundation" if agent_instance.is_connected else "deterministic-marine-guardrails",
        "dodo_payments_mode": billing_service.environment
    }


@app.post("/api/normalize", response_model=TestEntry)
def normalize_endpoint(raw_entry: RawInputEntry) -> TestEntry:
    return normalize_raw_entry(raw_entry)


@app.post("/api/hardware/poll", response_model=HardwareSyncResult)
async def hardware_poll_endpoint(config: HardwareControllerConfig) -> HardwareSyncResult:
    """
    Polls a physical marine aquarium controller (Neptune Apex, GHL Profilux, Hydros) on local LAN or REST.
    Returns detected probes and normalized marine telemetry.
    """
    return await poll_hardware_controller(config)


@app.post("/api/hardware/ingest", response_model=TestEntry)
def hardware_ingest_endpoint(payload: Dict[str, Any]) -> TestEntry:
    """
    Webhook ingest endpoint for Neptune Apex, reef-pi, Home Assistant, or automated dosers pushing JSON.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    probes: Dict[str, float] = {}
    for k, v in payload.items():
        try:
            probes[str(k)] = float(v)
        except (ValueError, TypeError):
            pass
    raw = map_probes_to_raw_entry(probes, now_iso)
    return normalize_raw_entry(raw)



@app.post("/api/predict", response_model=PredictionResponse)
def predict_endpoint(req: PredictionRequest) -> PredictionResponse:
    try:
        # 1. Feature Engineering
        feature_vec, indicators = build_feature_vector(req.current_test, req.history)

        # 2. TabPFN / Guardrails Risk Inference
        risk_assessment, engine_used = agent_instance.predict(
            feature_vector=feature_vec,
            current=req.current_test,
            indicators=indicators,
            tank_profile=req.tank_profile
        )

        # 3. Biological Dosing Remediation Plan
        remediation_plan = generate_remediation_plan(
            current=req.current_test,
            tank_profile=req.tank_profile
        )

        status = "success" if "fallback" not in engine_used else "fallback_engaged"

        return PredictionResponse(
            status=status,
            engine_used=engine_used,
            evaluated_at=datetime.now(timezone.utc).isoformat(),
            risk_assessment=risk_assessment,
            chemical_indicators=indicators,
            remediation_plan=remediation_plan
        )
    except Exception as exc:
        logger.error(f"Prediction pipeline failure: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/presets")
def get_presets() -> List[Dict[str, Any]]:
    now = datetime.now(timezone.utc)
    t_minus_2d = now - timedelta(days=2)
    t_minus_5d = now - timedelta(days=5)

    return [
        {
            "id": "preset_stable_sps",
            "name": "120G Acropora Sanctuary (Equilibrium)",
            "description": "Mature SPS reef with stable ionic balance, active calcification, and intact magnesium shield.",
            "tank_profile": {
                "tank_id": "tank_sps_01",
                "net_volume_liters": 450.0,
                "system_type": "sps_dominant",
                "dosing_method": "two_part_balling"
            },
            "current_test": {
                "timestamp": now.isoformat(),
                "salinity_sg": 1.0255,
                "alkalinity_dkh": 8.4,
                "calcium_ppm": 425.0,
                "magnesium_ppm": 1360.0,
                "nitrate_ppm": 5.0,
                "phosphate_ppm": 0.04,
                "temperature_c": 25.1,
                "ph": 8.25
            },
            "history": [
                {
                    "timestamp": t_minus_2d.isoformat(),
                    "salinity_sg": 1.0255,
                    "alkalinity_dkh": 8.45,
                    "calcium_ppm": 425.0,
                    "magnesium_ppm": 1365.0,
                    "nitrate_ppm": 4.8,
                    "phosphate_ppm": 0.04,
                    "temperature_c": 25.0,
                    "ph": 8.24
                },
                {
                    "timestamp": t_minus_5d.isoformat(),
                    "salinity_sg": 1.0254,
                    "alkalinity_dkh": 8.5,
                    "calcium_ppm": 430.0,
                    "magnesium_ppm": 1370.0,
                    "nitrate_ppm": 5.2,
                    "phosphate_ppm": 0.035,
                    "temperature_c": 25.0,
                    "ph": 8.26
                }
            ]
        },
        {
            "id": "preset_mg_collapse",
            "name": "The Silent Magnesium Collapse (Abiotic Snowstorm)",
            "description": "Magnesium has quietly dropped below 1180 ppm. While Alkalinity reads 8.2 dKH today, spontaneous precipitation will wipe out alkalinity in 24 hours.",
            "tank_profile": {
                "tank_id": "tank_sps_02",
                "net_volume_liters": 280.0,
                "system_type": "sps_dominant",
                "dosing_method": "two_part_balling"
            },
            "current_test": {
                "timestamp": now.isoformat(),
                "salinity_sg": 1.025,
                "alkalinity_dkh": 8.1,
                "calcium_ppm": 430.0,
                "magnesium_ppm": 1160.0,
                "nitrate_ppm": 4.2,
                "phosphate_ppm": 0.03,
                "temperature_c": 25.2,
                "ph": 8.28
            },
            "history": [
                {
                    "timestamp": t_minus_2d.isoformat(),
                    "salinity_sg": 1.025,
                    "alkalinity_dkh": 8.35,
                    "calcium_ppm": 430.0,
                    "magnesium_ppm": 1210.0,
                    "nitrate_ppm": 4.0,
                    "phosphate_ppm": 0.03,
                    "temperature_c": 25.1,
                    "ph": 8.26
                },
                {
                    "timestamp": t_minus_5d.isoformat(),
                    "salinity_sg": 1.025,
                    "alkalinity_dkh": 8.5,
                    "calcium_ppm": 435.0,
                    "magnesium_ppm": 1280.0,
                    "nitrate_ppm": 4.1,
                    "phosphate_ppm": 0.03,
                    "temperature_c": 25.0,
                    "ph": 8.25
                }
            ]
        },
        {
            "id": "preset_alk_shock",
            "name": "Dosing Pump Clog (Alkalinity Shock & RTN)",
            "description": "Alkalinity dropped 1.2 dKH in 48 hours due to a clogged dosing tube. Acropora tissue detachment will occur if not arrested.",
            "tank_profile": {
                "tank_id": "tank_sps_03",
                "net_volume_liters": 350.0,
                "system_type": "sps_dominant",
                "dosing_method": "two_part_balling"
            },
            "current_test": {
                "timestamp": now.isoformat(),
                "salinity_sg": 1.0252,
                "alkalinity_dkh": 6.8,
                "calcium_ppm": 415.0,
                "magnesium_ppm": 1340.0,
                "nitrate_ppm": 6.0,
                "phosphate_ppm": 0.05,
                "temperature_c": 25.1,
                "ph": 8.12
            },
            "history": [
                {
                    "timestamp": t_minus_2d.isoformat(),
                    "salinity_sg": 1.0252,
                    "alkalinity_dkh": 8.0,
                    "calcium_ppm": 420.0,
                    "magnesium_ppm": 1345.0,
                    "nitrate_ppm": 5.8,
                    "phosphate_ppm": 0.05,
                    "temperature_c": 25.0,
                    "ph": 8.22
                }
            ]
        },
        {
            "id": "preset_burnt_tips",
            "name": "Nutrient Bottom-Out (Burnt Tip Necrosis)",
            "description": "Aggressive GFO strip drove phosphate to 0.000 ppm while keeping alkalinity high (9.4 dKH). Zooxanthellae starve and release toxins.",
            "tank_profile": {
                "tank_id": "tank_mixed_01",
                "net_volume_liters": 200.0,
                "system_type": "mixed_reef",
                "dosing_method": "kalkwasser"
            },
            "current_test": {
                "timestamp": now.isoformat(),
                "salinity_sg": 1.0250,
                "alkalinity_dkh": 9.4,
                "calcium_ppm": 440.0,
                "magnesium_ppm": 1350.0,
                "nitrate_ppm": 0.20,
                "phosphate_ppm": 0.000,
                "temperature_c": 25.3,
                "ph": 8.35
            },
            "history": [
                {
                    "timestamp": t_minus_2d.isoformat(),
                    "salinity_sg": 1.0250,
                    "alkalinity_dkh": 9.2,
                    "calcium_ppm": 435.0,
                    "magnesium_ppm": 1350.0,
                    "nitrate_ppm": 0.8,
                    "phosphate_ppm": 0.01,
                    "temperature_c": 25.2,
                    "ph": 8.32
                }
            ]
        }
    ]


@app.post("/api/billing/create-checkout-session", response_model=CheckoutResponse)
def create_checkout(req: CheckoutRequest) -> CheckoutResponse:
    res = billing_service.create_checkout_session(
        customer_email=req.customer_email,
        customer_name=req.customer_name or "Reef Guardian",
        billing_cycle=req.billing_cycle
    )
    return CheckoutResponse(**res)


@app.post("/api/billing/webhook")
async def dodo_webhook(request: Request) -> Dict[str, str]:
    payload = await request.json()
    signature = request.headers.get("x-dodo-signature")
    billing_service.verify_and_process_webhook(payload, signature)
    return {"status": "received"}


@app.get("/api/user/status", response_model=UserStatusResponse)
def get_user_status(email: str = "guest@reef.org") -> UserStatusResponse:
    is_pro = billing_service.is_user_pro(email)
    return UserStatusResponse(
        user_id=email,
        is_pro=is_pro,
        unlocked_engine="tabpfn-unlimited" if is_pro else "tabpfn-standard",
        remaining_free_runs=999 if is_pro else 3
    )
