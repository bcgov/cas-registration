from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple, Generator
from decimal import ROUND_HALF_UP, Decimal
from django.utils import timezone
from compliance.constants import CLEAN_BC_LOGO_COMPLIANCE_INVOICE
from django.db.models import QuerySet
from service.pdf.pdf_generator_service import PDFGeneratorService
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
from compliance.models import ComplianceChargeRate
from compliance.service.exceptions import ComplianceInvoiceError

from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService

from registration.models import (
    Address,
    Operator,
    Operation,
)
from reporting.models import (
    ReportComplianceSummary,
)
from compliance.models import (
    ComplianceReportVersion,
    ComplianceObligation,
    ElicensingInvoice,
    ElicensingLineItem,
)


class ComplianceInvoiceService:
    @classmethod
    def generate_invoice_pdf(
        cls,
        compliance_report_version_id: int,
    ) -> Tuple[Generator[bytes, None, None], str, int] | Dict[str, Any]:
        """
        Generates a PDF invoice for compliance obligation.

        Args:
            compliance_report_version_id: ID of the compliance report version.

        Returns:
            - On success: Tuple (PDF generator, filename, total_size_in_bytes).
            - On error: Custom ComplianceInvoiceError
        """
        try:
            # Refresh the BCIERS data from Elicensing API
            refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
                compliance_report_version_id=compliance_report_version_id
            )
            if not refresh_result.data_is_fresh:
                raise ComplianceInvoiceError(
                    "stale_data",
                    "Invoice data could not be refreshed from Elicensing.  Please try again, or contact support if the problem persists.",
                )

            # Get operation information
            # compliance_report_version_id  →  ComplianceReportVersion → ComplianceReport → Report →  Operation
            operation: Operation = ComplianceReportVersionService.get_operation_by_compliance_report_version(
                compliance_report_version_id
            )
            operation_name = operation.name

            # Get operator information
            # Operation → Operator
            operator: Operator = operation.operator
            operator_name = operator.legal_name
            # Operator → Address
            operator_address: Optional[Address] = operator.physical_address

            operator_address_line1: str = ""
            operator_address_line2: str = ""

            if operator_address is not None:
                operator_address_line1 = operator_address.street_address or ""
                operator_address_line2 = ", ".join(
                    filter(
                        None,
                        [
                            operator_address.municipality or "",
                            operator_address.province or "",
                            operator_address.postal_code or "",
                        ],
                    )
                )

            # Get compliance obligation information
            # compliance_report_version_id  → ComplianceObligation
            compliance_obligation: ComplianceObligation = (
                ComplianceReportVersionService.get_obligation_by_compliance_report_version(compliance_report_version_id)
            )
            compliance_obligation_id = compliance_obligation.obligation_id
            invoice_date = (
                compliance_obligation.fee_date.strftime("%b %-d, %Y") if compliance_obligation.fee_date else "—"
            )

            # Get compliance obligation amounts
            # Get fee_amount_dollars (calculated emmissions * charge rate) from
            # ComplianceObligation  → ComplianceReportVersion
            compliance_report_version: ComplianceReportVersion = compliance_obligation.compliance_report_version
            fee_amount_dollars = compliance_obligation.fee_amount_dollars

            # Get excess_emissions from
            # ComplianceReportVersion → ReportComplianceSummary
            report_compliance_summary: ReportComplianceSummary = compliance_report_version.report_compliance_summary
            excess_emissions = report_compliance_summary.excess_emissions

            # Get charge_rate from
            # ComplianceReportVersion → ComplianceReport → CompliancePeriod → ReportingYear → ComplianceChargeRate
            charge_rate_decimal: Decimal = ComplianceChargeRate.objects.get(
                reporting_year=compliance_report_version.compliance_report.compliance_period.reporting_year
            ).rate

            # Format obligation amounts
            compliance_obligation_emissions = f"{excess_emissions} tCO₂e"
            compliance_obligation_charge_rate = f"${charge_rate_decimal:,.2f} / tCO₂e"
            compliance_obligation_fee_amount_dollars = f"${fee_amount_dollars:,.2f}"

            # Get reporting year
            compliance_obligation_year: int = (
                compliance_report_version.compliance_report.compliance_period.reporting_year.reporting_year
            )

            # Get invoice data
            invoice = refresh_result.invoice
            invoice_number = invoice.invoice_number
            invoice_due_date = invoice.due_date.strftime("%b %-d, %Y") if invoice.due_date else "—"

            # Build invoice biling items and amounts due
            amount_due, billing_items = cls.calculate_invoice_amount_due(invoice)
            total_amount_due = f"${amount_due.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP):,}"

            # Assemble context dictionary
            invoice_printed_date = timezone.now().strftime("%b %-d, %Y")
            context: Dict[str, Any] = {
                "invoice_number": invoice_number,
                "invoice_date": invoice_date,
                "invoice_due_date": invoice_due_date,
                "invoice_printed_date": invoice_printed_date,
                "operator_name": operator_name,
                "operator_address_line1": operator_address_line1,
                "operator_address_line2": operator_address_line2,
                "operation_name": operation_name,
                "compliance_obligation_year": compliance_obligation_year,
                "compliance_obligation_id": compliance_obligation_id,
                "compliance_obligation": compliance_obligation_emissions,
                "compliance_obligation_charge_rate": compliance_obligation_charge_rate,
                "compliance_obligation_equivalent_amount": compliance_obligation_fee_amount_dollars,
                "billing_items": billing_items,
                "total_amount_due": total_amount_due,
                "logo_base64": CLEAN_BC_LOGO_COMPLIANCE_INVOICE,
            }

            # Generate filename
            filename = f"invoice_{context['invoice_number']}_{datetime.now().strftime('%Y%m%d')}.pdf"

            # Generate and return the PDF generator, filename, and size
            return PDFGeneratorService.generate_pdf(
                template_name="invoice.html",
                context=context,
                filename=filename,
            )

        except Exception as exc:
            # If it’s already a ComplianceInvoiceError, just re‐raise it.
            if isinstance(exc, ComplianceInvoiceError):
                raise

            # Otherwise wrap in ComplianceInvoiceError and raise
            raise ComplianceInvoiceError("unexpected_error", str(exc))

    @staticmethod
    def calculate_invoice_amount_due(invoice: ElicensingInvoice) -> Tuple[Decimal, List[Dict[str, Any]]]:
        """
        Calculates the amount due for an invoice and returns billing items.
        Amount due (dynamic from eLicensing) = Compliance Obligation (fees) - Compliance Units Applied (adjustments) - Monetary payments (payments)

        Args:
            invoice (ElicensingInvoice): The invoice model instance.

        Returns:
            Tuple[Decimal, List[Dict[str, Any]]]: Amount due and billing items.
        """
        billing_items: List[Dict[str, Any]] = []
        total_fee = Decimal("0.00")
        total_payments = Decimal("0.00")
        total_adjustments = Decimal("0.00")

        fee_line_items: QuerySet[ElicensingLineItem] = invoice.elicensing_line_items.filter(
            line_item_type=ElicensingLineItem.LineItemType.FEE
        )

        for fee_line_item in fee_line_items:
            fee_date = fee_line_item.fee_date.strftime("%b %-d, %Y") if fee_line_item.fee_date else "—"
            billing_items.append(
                {
                    "date": fee_date,
                    "description": fee_line_item.description,
                    "amount": f"${fee_line_item.base_amount:,.2f}",
                }
            )
            total_fee += fee_line_item.base_amount

            for fee_payment in fee_line_item.elicensing_payments.all():
                fee_payment_date = (
                    fee_payment.received_date.strftime("%b %-d, %Y") if fee_payment.received_date else "—"
                )
                fee_payment_description = (
                    getattr(fee_payment, "description", None) or f"Payment {fee_payment.payment_object_id}"
                )
                billing_items.append(
                    {
                        "date": fee_payment_date,
                        "description": fee_payment_description,
                        "amount": f"(${fee_payment.amount:,.2f})",
                    }
                )
                total_payments += fee_payment.amount

            for fee_adjustment in fee_line_item.elicensing_adjustments.all():
                fee_adjustment_date = (
                    fee_adjustment.adjustment_date.strftime("%b %-d, %Y") if fee_adjustment.adjustment_date else "—"
                )
                fee_adjustment_description = (
                    fee_adjustment.reason or f"Adjustment {fee_adjustment.adjustment_object_id} ({fee_adjustment.type})"
                )
                billing_items.append(
                    {
                        "date": fee_adjustment_date,
                        "description": fee_adjustment_description,
                        "amount": f"(${fee_adjustment.amount:,.2f})",
                    }
                )
                total_adjustments += fee_adjustment.amount

        amount_due = (total_fee - total_payments - total_adjustments).quantize(Decimal("0.01"))
        return amount_due, billing_items
