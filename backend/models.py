from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class TankProfile(BaseModel):
    tank_id: str = Field(default="tank_default", description="Unique identifier for the tank")
    net_volume_liters: float = Field(default=280.0, ge=10.0, le=10000.0, description="Total net water volume in liters")
    system_type: Literal["sps_dominant", "mixed_reef", "lps_softie", "nano_reef"] = Field(
        default="sps_dominant",
        description="Type of coral reef ecosystem"
    )
    dosing_method: Literal["two_part_balling", "kalkwasser", "calcium_reactor", "manual_dosing"] = Field(
        default="two_part_balling",
        description="Chemical replenishment mechanism"
    )


class TestEntry(BaseModel):
    __test__ = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Measurement timestamp (UTC)")
    salinity_sg: float = Field(default=1.025, ge=1.010, le=1.035, description="Specific gravity (e.g. 1.025)")
    alkalinity_dkh: float = Field(default=8.4, ge=4.0, le=16.0, description="Alkalinity in dKH")
    calcium_ppm: float = Field(default=420.0, ge=250.0, le=600.0, description="Calcium concentration in ppm")
    magnesium_ppm: float = Field(default=1350.0, ge=800.0, le=1800.0, description="Magnesium concentration in ppm")
    nitrate_ppm: float = Field(default=5.0, ge=0.0, le=120.0, description="Nitrate concentration in ppm")
    phosphate_ppm: float = Field(default=0.04, ge=0.0, le=3.0, description="Phosphate concentration in ppm")
    temperature_c: float = Field(default=25.0, ge=18.0, le=35.0, description="Water temperature in Celsius")
    ph: float = Field(default=8.2, ge=7.0, le=9.0, description="Acidity/alkalinity scale")


class RawInputEntry(BaseModel):
    timestamp: Optional[datetime] = None
    salinity_value: float
    salinity_unit: Literal["sg", "ppt"] = "sg"
    alkalinity_value: float
    alkalinity_unit: Literal["dkh", "meq_l", "ppm"] = "dkh"
    calcium_ppm: float
    magnesium_ppm: float
    nitrate_ppm: float
    phosphate_ppm: float
    temperature_value: float
    temperature_unit: Literal["c", "f"] = "c"
    ph: float


class PredictionRequest(BaseModel):
    tank_profile: TankProfile = Field(default_factory=TankProfile)
    current_test: TestEntry
    history: List[TestEntry] = Field(default_factory=list)


class RiskAssessment(BaseModel):
    crash_probability_48h: float = Field(..., ge=0.0, le=1.0)
    risk_level: Literal["STABLE", "COUPLING_DRIFT", "IMMINENT_COLLAPSE"]
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    primary_driver: str
    secondary_driver: Optional[str] = None


class ChemicalIndicators(BaseModel):
    mg_ca_ratio: float
    mg_ca_status: str
    alk_velocity_24h: float
    ca_velocity_24h: float
    mg_velocity_24h: float
    ionic_product_index: float
    aragonite_saturation_proxy: float
    redfield_nutrient_ratio: float
    nutrient_starvation_flag: int


class RemediationAction(BaseModel):
    day: int
    date: str
    action: str
    chemical: str
    amount_ml: float
    expected_parameter_end_of_day: Dict[str, float]
    reasoning: str


class RemediationPlan(BaseModel):
    target_parameters: Dict[str, float]
    rate_limited_schedule: List[RemediationAction]


class PredictionResponse(BaseModel):
    status: Literal["success", "fallback_engaged", "error"]
    engine_used: str
    evaluated_at: str
    risk_assessment: RiskAssessment
    chemical_indicators: ChemicalIndicators
    remediation_plan: RemediationPlan


class CheckoutRequest(BaseModel):
    customer_email: str
    customer_name: Optional[str] = "Reef Guardian"
    billing_cycle: Literal["monthly", "yearly"] = "monthly"


class CheckoutResponse(BaseModel):
    session_id: str
    checkout_url: str
    status: str


class UserStatusResponse(BaseModel):
    user_id: str
    is_pro: bool
    unlocked_engine: str
    remaining_free_runs: int
