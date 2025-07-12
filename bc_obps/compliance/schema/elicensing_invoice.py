from compliance.models.elicensing_invoice import ElicensingInvoice
from ninja import ModelSchema


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
