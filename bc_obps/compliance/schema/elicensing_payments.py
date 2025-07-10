from typing import List
from compliance.models.elicensing_payment import ElicensingPayment
from ninja import Schema, ModelSchema


class ElicensingPaymentOut(ModelSchema):
    """Schema for a single payment record"""

    class Meta:
        model = ElicensingPayment
        fields = ['id', 'amount', 'received_date']


class ElicensingPaymentListOut(Schema):
    data_is_fresh: bool
    rows: List[ElicensingPaymentOut]
    row_count: int
