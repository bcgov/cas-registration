from ninja import Schema, Field
from compliance.service.bc_carbon_registry.schema import FifteenDigitString


class ProjectIn(Schema):
    """Schema for BCCR project creation."""

    bccr_holding_account_id: FifteenDigitString = Field(..., min_length=1)
    bccr_trading_name: str = Field(..., min_length=1)
