from typing import List
from decimal import Decimal
from compliance.models.elicensing_payment import ElicensingPayment
from ninja import Schema, ModelSchema


class PaymentOut(ModelSchema):
    """Schema for a single payment record"""

    class Meta:
        model = ElicensingPayment
        fields = ['id', 'amount', 'received_date']


class DashboardPaymentRow(Schema):
    """Schema for a single payment dashboard record"""

    id: int
    compliance_period: int
    operation_name: str
    payment_towards: str
    invoice_number: str
    payment_amount: Decimal
    outstanding_balance: Decimal


class DashboardPaymentList(Schema):
    rows: List[DashboardPaymentRow]
    row_count: int


class ElicensingPaymentListOut(Schema):
    data_is_fresh: bool
    rows: List[PaymentOut]
    row_count: int
