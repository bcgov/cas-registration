from decimal import Decimal
from ninja import Schema


class AccruingPenaltiesOut(Schema):
    faa_interest: Decimal
    automatic_overdue_penalty_amount: Decimal
    ggeapar_interest_amount: Decimal
