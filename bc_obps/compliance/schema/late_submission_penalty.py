from decimal import Decimal
from ninja import Schema
from typing import Any


class LateSubmissionPenaltyOut(Schema):
    """
    Schema for late submission penalty (GGEAPAR Interest) data returned from the API.
    """

    penalty_status: str
    has_penalty: bool
    penalty_type: str
    penalty_amount: Decimal
    faa_interest: Decimal
    total_amount: Decimal

    @staticmethod
    def resolve_penalty_status(obj: Any) -> str:
        """
        Transform penalty status from uppercase to title case for display.
        """
        if isinstance(obj, dict):
            value = obj.get("penalty_status")
        else:
            value = getattr(obj, "penalty_status", None)

        return str(value).title() if value else ""
