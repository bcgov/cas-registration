from decimal import Decimal
from typing import List, Optional

from compliance.service.bc_carbon_registry.schema import FifteenDigitString
from ninja import Schema


class BCCRUnit(Schema):
    """Schema for BCCR units to be applied"""

    id: str
    type: str
    serial_number: str
    vintage_year: str
    quantity_available: int
    quantity_to_be_applied: int | None = None


class AppliedComplianceUnit(Schema):
    """Schema for applied compliance units in grid format"""

    id: str | None = None
    type: str | None = None
    serial_number: str | None = None
    vintage_year: str | None = None
    quantity_applied: str | None = None
    equivalent_value: str | None = None


class AppliedComplianceUnitsOut(Schema):
    """Wrapper schema for applied units and credit cap metadata."""

    applied_compliance_units: list[AppliedComplianceUnit]
    can_apply_compliance_units: bool


class ApplyComplianceUnitsOut(Schema):
    """Schema for showing all the data on the Apply Compliance Units page"""

    bccr_trading_name: str | None = None
    bccr_compliance_account_id: str | None = None
    bccr_units: list[BCCRUnit] = []
    charge_rate: Decimal | None = None
    outstanding_balance: Decimal | None = None
    compliance_unit_cap_limit: Decimal | None = None
    compliance_unit_cap_remaining: Decimal | None = None
    max_credit_usage_percentage: Decimal | None = None


class ApplyComplianceUnitsIn(Schema):
    """Schema for the input data for the Apply Compliance Units page"""

    bccr_holding_account_id: FifteenDigitString
    bccr_compliance_account_id: FifteenDigitString
    bccr_units: list[BCCRUnit] = []
    total_equivalent_value: Decimal
