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


class DashboardPaymentRow(Schema):
    """Schema for a single payment dashboard record"""

    compliance_period: int
    operation_name: str
    payment_towards: str
    invoice_number: str
    payment_amount: Decimal
    outstanding_balance: Decimal


class DashboardPaymentList(Schema):
    rows: List[DashboardPaymentRow]
    row_count: int
