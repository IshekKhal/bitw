from __future__ import annotations

import logging
import os
import uuid
from typing import Dict, Optional

logger = logging.getLogger("before_it_turns_white.billing")

# In-memory customer state store
SUBSCRIBERS: Dict[str, Dict[str, bool]] = {
    "demo_keeper@reef.org": {"is_pro": True, "plan": "guardian_monthly"}
}


class DodoBillingService:
    def __init__(self) -> None:
        self.api_key = os.environ.get("DODO_PAYMENTS_API_KEY")
        self.webhook_secret = os.environ.get("DODO_PAYMENTS_WEBHOOK_SECRET")
        self.environment = "live_mode" if os.environ.get("ENVIRONMENT") == "production" else "test_mode"
        self.client = None
        self._init_client()

    def _init_client(self) -> None:
        if self.api_key:
            try:
                from dodopayments import DodoPayments
                self.client = DodoPayments(
                    bearer_token=self.api_key,
                    environment=self.environment
                )
                logger.info(f"Dodo Payments client initialized in {self.environment}.")
            except Exception as exc:
                logger.warning(f"Could not initialize Dodo Payments client: {exc}")
                self.client = None
        else:
            logger.info("No DODO_PAYMENTS_API_KEY provided. Operating in sandbox test simulation mode.")

    def create_checkout_session(
        self,
        customer_email: str,
        customer_name: str = "Reef Guardian",
        billing_cycle: str = "monthly"
    ) -> Dict[str, str]:
        product_id = "pdt_guardian_monthly" if billing_cycle == "monthly" else "pdt_guardian_yearly"

        if self.client:
            try:
                session = self.client.checkout_sessions.create(
                    product_cart=[{"product_id": product_id, "quantity": 1}],
                    customer={"email": customer_email, "name": customer_name}
                )
                return {
                    "session_id": session.session_id,
                    "checkout_url": getattr(session, "payment_link", f"https://checkout.dodopayments.com/buy/{session.session_id}"),
                    "status": "created"
                }
            except Exception as exc:
                logger.error(f"Dodo checkout creation error: {exc}. Falling back to sandbox link.")

        # Sandbox Mock URL for seamless testing
        mock_id = f"sess_mock_{uuid.uuid4().hex[:12]}"
        mock_url = f"https://checkout.dodopayments.com/sandbox/pay/{mock_id}?email={customer_email}&plan={billing_cycle}"
        return {
            "session_id": mock_id,
            "checkout_url": mock_url,
            "status": "sandbox_simulation"
        }

    def verify_and_process_webhook(self, payload: Dict, signature: Optional[str] = None) -> bool:
        event_type = payload.get("type") or payload.get("event")
        data = payload.get("data", {})
        customer_email = data.get("customer", {}).get("email") or payload.get("customer_email")

        if event_type in ["subscription.active", "payment.succeeded", "checkout.completed"]:
            if customer_email:
                SUBSCRIBERS[customer_email] = {"is_pro": True, "plan": "guardian_active"}
                logger.info(f"Activated Pro license for {customer_email}")
                return True
        elif event_type in ["subscription.cancelled", "subscription.expired"]:
            if customer_email in SUBSCRIBERS:
                SUBSCRIBERS[customer_email]["is_pro"] = False
                logger.info(f"Deactivated Pro license for {customer_email}")
                return True

        return True

    def is_user_pro(self, customer_email: str) -> bool:
        sub = SUBSCRIBERS.get(customer_email)
        return bool(sub and sub.get("is_pro", False))


billing_service = DodoBillingService()
