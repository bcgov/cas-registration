from decimal import Decimal
from ninja import Schema
from compliance.models import CompliancePenalty
from enum import Enum


class PenaltyTypeStatusEnum(str, Enum):
    ACCRUING = "Accruing"
    PAID = "Paid"
    NONE = "None"


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

    automatic_overdue_penalty_status: PenaltyTypeStatusEnum
    ggeapar_interest_status: PenaltyTypeStatusEnum
    penalty_type: CompliancePenalty.PenaltyType | None = None
    days_late: int | None = None
    total_penalty: Decimal | None = None
    daily_accumulated_list: list[PenaltyAccrual] = []
    message: str | None = None
