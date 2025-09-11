from decimal import Decimal
from typing import Optional
from compliance.models.elicensing_invoice import ElicensingInvoice
from ninja import Field, ModelSchema, Schema


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

class ElicensingInvoiceListOut(ModelSchema):
    compliance_period: int = Field(..., alias="compliance_obligation.compliance_report_version.compliance_report.report.reporting_year.reporting_year")
    operator_legal_name: str = Field(...,alias='compliance_obligation.compliance_report_version.compliance_report.report.operator.legal_name')
    operation_name: str = Field(...,alias='compliance_obligation.compliance_report_version.compliance_report.report.operation.name')
    invoice_total: Optional[Decimal] = None
    total_adjustments: Optional[Decimal] = None
    total_payments: Optional[Decimal] = None
    invoice_type: Optional[str] = None
    

    class Meta:
        model = ElicensingInvoice
        fields = ['id', 'invoice_number','outstanding_balance']