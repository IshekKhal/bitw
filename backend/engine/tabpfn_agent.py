from __future__ import annotations

import logging
import os
from typing import Optional, Tuple
import numpy as np
import pandas as pd

from backend.data.synthetic_reef_dataset import generate_curated_reef_dataset
from backend.engine.features import FEATURE_NAMES
from backend.engine.guardrails import evaluate_deterministic_guardrails
from backend.models import ChemicalIndicators, RiskAssessment, TankProfile, TestEntry

logger = logging.getLogger("before_it_turns_white.tabpfn")


class TabPFNMarineAgent:
    def __init__(self) -> None:
        self.model = None
        self.in_context_df, self.in_context_y = generate_curated_reef_dataset(n_samples=500, random_seed=42)
        self.is_connected = False
        self._initialize_client()

    def _initialize_client(self) -> None:
        token = os.environ.get("TABPFN_TOKEN") or os.environ.get("PRIOR_LABS_API_KEY")

        if not token:
            logger.info("No TABPFN_TOKEN or PRIOR_LABS_API_KEY detected. Agent running in deterministic fallback mode.")
            return

        try:
            import tabpfn_client
            tabpfn_client.set_access_token(token)
            self.model = tabpfn_client.TabPFNClassifier()
            # Fit in-context marine trajectories
            self.model.fit(self.in_context_df, self.in_context_y)
            self.is_connected = True
            logger.info("Successfully initialized Prior Labs TabPFN-3.5 client with 500 in-context trajectories.")
        except Exception as exc:
            logger.warning(f"Failed to initialize TabPFN-3.5 API client: {exc}. Operating on deterministic guardrails.")
            self.is_connected = False
            self.model = None

    def predict(
        self,
        feature_vector: np.ndarray,
        current: TestEntry,
        indicators: ChemicalIndicators,
        tank_profile: TankProfile
    ) -> Tuple[RiskAssessment, str]:
        # Always run deterministic assessment as baseline / sanity check
        det_assessment = evaluate_deterministic_guardrails(current, indicators, tank_profile)

        if not self.is_connected or self.model is None:
            return det_assessment, "deterministic-marine-guardrails"

        try:
            query_df = pd.DataFrame([feature_vector], columns=FEATURE_NAMES)
            proba = self.model.predict_proba(query_df)

            # Class 1 is crash probability
            crash_prob = float(proba[0][1])

            # Calibrate with extreme biological guardrails (e.g. if Alk swing is massive, don't let ML underestimate)
            effective_risk = max(crash_prob, det_assessment.crash_probability_48h) if det_assessment.crash_probability_48h > 0.70 else crash_prob

            if effective_risk >= 0.45:
                risk_level = "IMMINENT_COLLAPSE"
            elif effective_risk >= 0.15:
                risk_level = "COUPLING_DRIFT"
            else:
                risk_level = "STABLE"

            # Primary driver synthesis
            primary_driver = det_assessment.primary_driver
            secondary_driver = det_assessment.secondary_driver

            assessment = RiskAssessment(
                crash_probability_48h=round(effective_risk, 2),
                risk_level=risk_level,
                confidence_score=round(float(max(proba[0])), 2),
                primary_driver=primary_driver,
                secondary_driver=secondary_driver
            )

            return assessment, "tabpfn-3.5-foundation"
        except Exception as exc:
            logger.error(f"TabPFN inference exception: {exc}. Engaging deterministic guardrails.")
            return det_assessment, "deterministic-marine-guardrails (fallback)"


# Global singleton instance
agent_instance = TabPFNMarineAgent()
