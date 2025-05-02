from typing import List
from decimal import Decimal
from ninja import Schema


class PaymentOut(Schema):
    """Schema for a single payment record"""

    id: str
    paymentReceivedDate: str
    paymentAmountApplied: Decimal
    paymentMethod: str
    transactionType: str
    receiptNumber: str


class PaymentsListOut(Schema):
    """Schema for the list of payments response"""

    rows: List[PaymentOut]
    row_count: int
