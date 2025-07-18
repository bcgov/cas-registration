from decimal import Decimal
from typing import Optional, List
from compliance.service.bc_carbon_registry.schema import FifteenDigitString
from ninja import Schema


class BCCRUnit(Schema):
    """Schema for BCCR units to be applied"""

    id: str
    type: str
    serial_number: str
    vintage_year: int
    quantity_available: int
    quantity_to_be_applied: Optional[int] = None


class AppliedComplianceUnit(Schema):
    """Schema for applied compliance units in grid format"""

    id: Optional[str] = None
    type: Optional[str] = None
    serial_number: Optional[str] = None
    vintage_year: Optional[int] = None
    quantity_applied: Optional[str] = None
    equivalent_value: Optional[str] = None


class ApplyComplianceUnitsOut(Schema):
    """Schema for showing all the data on the Apply Compliance Units page"""

    bccr_trading_name: Optional[str] = None
    bccr_compliance_account_id: Optional[str] = None
    charge_rate: Optional[Decimal] = None
    outstanding_balance: Optional[Decimal] = None
    bccr_units: List[BCCRUnit] = []


class ApplyComplianceUnitsIn(Schema):
    """Schema for the input data for the Apply Compliance Units page"""

    bccr_holding_account_id: FifteenDigitString
    bccr_compliance_account_id: FifteenDigitString
    bccr_units: List[BCCRUnit] = []
    total_equivalent_value: Decimal
