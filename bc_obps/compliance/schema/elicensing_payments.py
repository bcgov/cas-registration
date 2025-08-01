from typing import List, Optional
from compliance.models.elicensing_payment import ElicensingPayment
from ninja import ModelSchema, Schema


class ElicensingPaymentOut(ModelSchema):
    formatted_received_date: Optional[
        str
    ] = None  # Pydantic doesn't like changing the type of a model field, so we create a synthetic field instead of trying to change received_date

    @staticmethod
    def resolve_formatted_received_date(obj: ElicensingPayment) -> str | None:
        if obj.received_date:
            return obj.received_date.strftime('%b %d, %Y')
        return None

    class Meta:
        model = ElicensingPayment
        fields = ['id', 'amount', 'received_date', 'payment_object_id', 'method', 'receipt_number']


class ElicensingPaymentListOut(Schema):
    data_is_fresh: bool
    rows: List[ElicensingPaymentOut]
    row_count: int
