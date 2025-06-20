from decimal import Decimal
from typing import Optional, List
from compliance.service.bc_carbon_registry.schema import FifteenDigitString
from ninja import Schema


class BCCRUnit(Schema):
    id: str
    type: str
    serial_number: str
    vintage_year: int
    quantity_available: int
    quantity_to_be_applied: Optional[int] = None


class ApplyComplianceUnitsOut(Schema):
    bccr_trading_name: Optional[str] = None
    bccr_compliance_account_id: Optional[str] = None
    charge_rate: Optional[Decimal] = None
    outstanding_balance: Optional[str] = None
    bccr_units: List[BCCRUnit] = []


class ApplyComplianceUnitsIn(Schema):
    bccr_holding_account_id: FifteenDigitString
    bccr_compliance_account_id: FifteenDigitString
    bccr_units: List[BCCRUnit] = []
