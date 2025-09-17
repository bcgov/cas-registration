from decimal import Decimal
from typing import Optional
from compliance.models.elicensing_invoice import ElicensingInvoice
from ninja import ModelSchema, Schema


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
    compliance_period: Optional[int] = None
    operator_legal_name: Optional[str] = None
    operation_name: Optional[str] = None
    invoice_total: Optional[Decimal] = None
    total_adjustments: Optional[Decimal] = None
    total_payments: Optional[Decimal] = None
    invoice_type: Optional[str] = None

    @staticmethod
    def resolve_compliance_period(obj: ElicensingInvoice) -> Optional[int]:
        obligation = getattr(obj, "compliance_obligation", None)
        if obligation:
            return (
                obj.compliance_obligation.compliance_report_version.compliance_report.report.reporting_year.reporting_year
            )
        penalty = getattr(obj, "compliance_penalty", None)
        if penalty:
            return (
                obj.compliance_penalty.compliance_obligation.compliance_report_version.compliance_report.report.reporting_year.reporting_year
            )
        return None

    @staticmethod
    def resolve_operator_legal_name(obj: ElicensingInvoice) -> Optional[str]:
        obligation = getattr(obj, "compliance_obligation", None)
        if obligation:
            return obj.compliance_obligation.compliance_report_version.compliance_report.report.operator.legal_name
        penalty = getattr(obj, "compliance_penalty", None)
        if penalty:
            return (
                obj.compliance_penalty.compliance_obligation.compliance_report_version.report_compliance_summary.report_version.report_operation.operator_legal_name
            )
        return None

    @staticmethod
    def resolve_operation_name(obj: ElicensingInvoice) -> Optional[str]:
        obligation = getattr(obj, "compliance_obligation", None)
        if obligation:
            return (
                obj.compliance_obligation.compliance_report_version.report_compliance_summary.report_version.report_operation.operation_name
            )
        penalty = getattr(obj, "compliance_penalty", None)
        if penalty:
            return (
                obj.compliance_penalty.compliance_obligation.compliance_report_version.report_compliance_summary.report_version.report_operation.operation_name
            )

        return None

    class Meta:
        model = ElicensingInvoice
        fields = ["id", "invoice_number", "outstanding_balance"]
