from decimal import Decimal
from ninja import Schema


class AutomaticOverduePenaltyOut(Schema):
    """
    Schema for automatic overdue penalty data returned from the API.
    Matches the frontend TypeScript interface and the penalty calculation service output.
    """

    penalty_status: str
    penalty_type: str
    days_late: int
    penalty_charge_rate: Decimal
    accumulated_penalty: Decimal
    accumulated_compounding: Decimal
    total_penalty: Decimal
    faa_interest: Decimal
    total_amount: Decimal
    data_is_fresh: bool

    @staticmethod
    def resolve_penalty_status(obj: dict) -> str:
        """
        Transform penalty status from uppercase to title case for display.
        """
        if not obj.get('penalty_status'):
            return ""

        status = obj.get('penalty_status')
        return str(status).title()
