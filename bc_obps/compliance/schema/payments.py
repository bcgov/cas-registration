from typing import List
from compliance.models.elicensing_payment import ElicensingPayment
from ninja import ModelSchema, Schema


class PaymentOut(ModelSchema):
    """Schema for a single payment record using actual model field names"""

    class Meta:
        model = ElicensingPayment
        fields = ['id', 'amount', 'received_date', 'payment_object_id']


class ElicensingPaymentListOut(Schema):
    data_is_fresh: bool
    rows: List[PaymentOut]
    row_count: int
