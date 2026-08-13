from decimal import Decimal
from ninja import Schema
from compliance.models import CompliancePenalty


class PenaltyAccrual(Schema):
    date: str
    interest_rate: Decimal
    daily_penalty: Decimal
    daily_compounded: Decimal
    accumulated_penalty: Decimal
    accumulated_compounded: Decimal


class CalculatedPenaltyOut(Schema):
    """
    Schema for a calculated penalty for an obligation that has not yet been met returned from the API.
    """

    penalty_type: CompliancePenalty.PenaltyType
    days_late: int
    total_penalty: Decimal
    daily_accumulated_list: list[PenaltyAccrual]
