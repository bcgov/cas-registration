from decimal import Decimal
from ninja import Schema


class LateSubmissionPenaltyOut(Schema):
    """
    Schema for late submission penalty (GGEAPAR Interest) data returned from the API.
    """

    penalty_status: str
    has_penalty: bool
    penalty_type: str
    penalty_charge_rate: Decimal
    penalty_amount: Decimal
    faa_interest: Decimal
    total_amount: Decimal
    data_is_fresh: bool
