from decimal import Decimal
from typing import Literal, Optional
from compliance.models.elicensing_invoice import ElicensingInvoice
from ninja import Schema, ModelSchema, Field, FilterSchema


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
    compliance_period: Optional[int] = Field(
        None,
        description=(
            "Reporting year derived from the associated record: "
            "uses the Compliance Obligation’s reporting year if present, "
            "otherwise the Penalty’s reporting year."
        ),
    )
    operation_name: Optional[str] = Field(
        None,
        description=(
            "Operation name derived from the associated record: "
            "uses the Compliance Obligation path if present, otherwise the Penalty path."
        ),
    )
    operator_legal_name: Optional[str] = Field(
        None,
        description="Operator legal name via the linked eLicensing client operator.",
    )
    invoice_type: Optional[Literal["Compliance obligation", "Automatic overdue penalty", "Late Submission Penalty"]] = (
        Field(
            None,
            description=(
                "Classified by association: "
                "‘Late Submission Penalty’ when a late submission penalty link exists; "
                "‘Automatic overdue penalty’ when a penalty link exists; "
                "otherwise ‘Compliance obligation’."
            ),
        )
    )
    invoice_total: Optional[Decimal] = Field(
        None,
        description="Computed invoice total (e.g., fees + interest). Calculated server-side.",
    )
    total_adjustments: Optional[Decimal] = Field(
        None,
        description="Sum of adjustments applied to the invoice. Calculated server-side.",
    )
    total_payments: Optional[Decimal] = Field(
        None,
        description="Sum of payments applied to the invoice. Calculated server-side.",
    )

    class Meta:
        model = ElicensingInvoice
        fields = [
            "id",
            "invoice_number",
            "outstanding_balance",
            "invoice_interest_balance",
            "due_date",
            "is_void",
            "last_refreshed",
        ]


class ElicensingInvoiceFilterSchema(FilterSchema):
    operator_legal_name: Optional[str] = Field(None, json_schema_extra={'q': 'operator_legal_name__icontains'})
    operation_name: Optional[str] = Field(None, json_schema_extra={'q': 'operation_name__icontains'})
    invoice_type: Optional[str] = Field(None, json_schema_extra={'q': 'invoice_type__icontains'})
    invoice_number: Optional[str] = Field(None, json_schema_extra={'q': 'invoice_number__icontains'})
    compliance_period: Optional[str] = Field(None, json_schema_extra={'q': 'compliance_period__icontains'})
    invoice_total: Optional[str] = Field(None, json_schema_extra={'q': 'invoice_total__icontains'})
    total_payments: Optional[str] = Field(None, json_schema_extra={'q': 'total_payments__icontains'})
    total_adjustments: Optional[str] = Field(None, json_schema_extra={'q': 'total_adjustments__icontains'})
