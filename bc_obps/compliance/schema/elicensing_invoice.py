from compliance.models.elicensing_invoice import ElicensingInvoice
from ninja import ModelSchema, Schema
from datetime import datetime



class ElicensingInvoiceOut(ModelSchema):
    """Schema for an invoice record"""

    class Meta:
        model = ElicensingInvoice
        fields = [
            'id',
            'invoice_number',
            'invoice_fee_balance',
            'invoice_interest_balance',
            'outstanding_balance',
            'due_date',
        ]

class ElicensingLastRefreshOut(Schema):
    """Schema for the E-licensing last refresh status."""
    last_refreshed_display: str | None
    data_is_fresh: bool