from decimal import Decimal
from ninja import Schema
from compliance.models import ComplianceObligation, CompliancePenalty
from enum import Enum


class PenaltyTypeStatus(str, Enum):
    NONE = ComplianceObligation.PenaltyStatus.NONE.value
    ACCRUING = ComplianceObligation.PenaltyStatus.ACCRUING.value
    PAID = ComplianceObligation.PenaltyStatus.PAID.value
    NOT_PAID = ComplianceObligation.PenaltyStatus.NOT_PAID.value
    NOT_APPLICABLE = "NOT APPLICABLE"


class PenaltyAccrual(Schema):
    date: str
    interest_rate: Decimal
    daily_penalty: Decimal
    daily_compounded: Decimal
    accumulated_penalty: Decimal
    accumulated_compounded: Decimal


class CalculatedPenaltyOut(Schema):
    automatic_overdue_penalty_status: PenaltyTypeStatus
    ggeapar_interest_status: PenaltyTypeStatus
    penalty_type: CompliancePenalty.PenaltyType
    days_late: int = 0
    total_penalty: Decimal = Decimal("0.00")
    daily_accumulated_list: list[PenaltyAccrual] = []
