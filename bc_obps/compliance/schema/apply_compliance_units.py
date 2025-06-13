from decimal import Decimal
from typing import Optional, List
from ninja import Schema


class BCCRUnit(Schema):
    id: int
    type: str
    serial_number: str
    vintage_year: int
    quantity_available: int


class ApplyComplianceUnitsOut(Schema):
    bccr_trading_name: Optional[str] = None
    bccr_compliance_account_id: Optional[int] = None
    charge_rate: Optional[Decimal] = None
    outstanding_balance: Optional[str] = None
    bccr_units: List[BCCRUnit] = []
