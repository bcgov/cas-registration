from typing import List
from ninja import Schema


class PaymentOut(Schema):
    """Schema for a single payment record"""

    id: str  # paymentObjectId is always a string from eLicensing
    paymentReceivedDate: str
    paymentAmountApplied: float
    paymentMethod: str
    transactionType: str
    referenceNumber: str


class PaymentsListOut(Schema):
    """Schema for the list of payments response"""

    rows: List[PaymentOut]
    row_count: int
