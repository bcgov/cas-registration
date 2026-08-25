from typing import Optional
from ninja import Schema


class BCCRAccountDetailsSchema(Schema):
    bccr_trading_name: str | None
    has_remote_bccr_errors: Optional[bool] = False
