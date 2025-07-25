from typing import List
from compliance.models.elicensing_payment import ElicensingPayment
from ninja import ModelSchema, Schema


class ElicensingPaymentOut(ModelSchema):
    """Schema for a single payment record using actual model field names"""

    class Meta:
        model = ElicensingPayment
        fields = ['id', 'amount', 'received_date', 'payment_object_id', 'method', 'receipt_number']


class ElicensingPaymentListOut(Schema):
    data_is_fresh: bool
    rows: List[ElicensingPaymentOut]
    row_count: int
