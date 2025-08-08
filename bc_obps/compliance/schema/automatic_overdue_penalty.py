from decimal import Decimal
from compliance.schema.elicensing_payments import ElicensingPaymentListOut
from ninja import Schema
from typing import Any


class _PenaltyStatusBase(Schema):
    penalty_status: str
    data_is_fresh: bool

    @staticmethod
    def resolve_penalty_status(obj: Any) -> str:
        if isinstance(obj, dict):
            value = obj.get("penalty_status")
        else:
            value = getattr(obj, "penalty_status", None)

        return str(value).title() if value else ""


class AutomaticOverduePenaltyOut(_PenaltyStatusBase):
    """
    Schema for automatic overdue penalty data returned from the API.
    Matches the frontend TypeScript interface and the penalty calculation service output.
    """

    penalty_type: str
    days_late: int
    penalty_charge_rate: Decimal
    accumulated_penalty: Decimal
    accumulated_compounding: Decimal
    total_penalty: Decimal
    faa_interest: Decimal
    total_amount: Decimal


class PenaltyWithPaymentsOut(_PenaltyStatusBase):
    """
    Schema for penalty data with payments
    """

    outstanding_amount: Decimal
    payment_data: ElicensingPaymentListOut
