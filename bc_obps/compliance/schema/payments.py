from typing import List
from compliance.models.elicensing_payment import ElicensingPayment
from ninja import Schema
from decimal import Decimal


class PaymentOut(Schema):
    """Schema for a single payment record matching frontend expectations"""

    id: int
    paymentAmountApplied: Decimal
    paymentReceivedDate: str
    paymentMethod: str
    transactionType: str
    receiptNumber: str

    @staticmethod
    def from_elicensing_payment(payment: ElicensingPayment) -> 'PaymentOut':
        """Convert ElicensingPayment model to PaymentOut schema"""
        return PaymentOut(
            id=payment.id,
            paymentAmountApplied=payment.amount,
            paymentReceivedDate=payment.received_date.strftime('%Y-%m-%d') if payment.received_date else '-',
            paymentMethod='-',  # Not available in current model
            transactionType='Payment',  # Default value
            receiptNumber=str(payment.payment_object_id),
        )


class ElicensingPaymentListOut(Schema):
    data_is_fresh: bool
    rows: List[PaymentOut]
    row_count: int
