from django.db.models import Prefetch, QuerySet
from typing import Dict, Any, List, Optional, Tuple, Generator
from decimal import ROUND_HALF_UP, Decimal
from django.utils import timezone
from compliance.constants import CLEAN_BC_LOGO_COMPLIANCE_INVOICE
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

from compliance.dataclass import ComplianceInvoiceContext


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
            operator_address_line1, operator_address_line2 = cls.format_operator_address(operator.physical_address)

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
            invoice_is_void = (
                invoice.is_void
                and compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
            )

            # Build invoice biling items and amounts due
            amount_due, billing_items = cls.calculate_invoice_amount_due(invoice)
            total_amount_due = f"${amount_due.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP):,}"

            # Assemble context dictionary
            invoice_printed_date = timezone.now().strftime("%b %-d, %Y")
            context_obj = ComplianceInvoiceContext(
                invoice_number=invoice_number,
                invoice_date=invoice_date,
                invoice_due_date=invoice_due_date,
                invoice_printed_date=invoice_printed_date,
                invoice_is_void=invoice_is_void,
                operator_name=operator_name,
                operator_address_line1=operator_address_line1,
                operator_address_line2=operator_address_line2,
                operation_name=operation_name,
                compliance_obligation_year=compliance_obligation_year,
                compliance_obligation_id=compliance_obligation_id,
                compliance_obligation=compliance_obligation_emissions,
                compliance_obligation_charge_rate=compliance_obligation_charge_rate,
                compliance_obligation_equivalent_amount=compliance_obligation_fee_amount_dollars,
                billing_items=billing_items,
                total_amount_due=total_amount_due,
                logo_base64=CLEAN_BC_LOGO_COMPLIANCE_INVOICE,
            )

            context = context_obj.__dict__

            # Generate filename
            filename = f"invoice_{context['invoice_number']}_{timezone.now().strftime('%Y%m%d')}.pdf"

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
    def format_operator_address(address: Optional[Address]) -> Tuple[str, str]:
        """
        Formats an operator's address into two lines.

        Args:
            address (Optional[Address]): The physical address.

        Returns:
            Tuple[str, str]: (line1, line2)
        """
        if not address:
            return "", ""

        line1 = address.street_address or ""
        line2 = ", ".join(
            filter(
                None,
                [
                    address.municipality or "",
                    address.province or "",
                    address.postal_code or "",
                ],
            )
        )
        return line1, line2

    @staticmethod
    def calculate_invoice_amount_due(invoice: ElicensingInvoice) -> Tuple[Decimal, List[Dict[str, Any]]]:
        billing_items: List[Dict[str, Any]] = []
        total_fee = Decimal("0.00")
        total_payments = Decimal("0.00")
        total_adjustments = Decimal("0.00")

        fee_line_items: QuerySet[ElicensingLineItem] = invoice.elicensing_line_items.filter(
            line_item_type=ElicensingLineItem.LineItemType.FEE
        ).prefetch_related(
            Prefetch("elicensing_payments"),
            Prefetch("elicensing_adjustments"),
        )

        for line_item in fee_line_items:
            line_total, line_billing_items = ComplianceInvoiceService._build_line_item_entry(line_item)
            billing_items.extend(line_billing_items)
            total_fee += line_total

            payments_total, payments_billing_items = ComplianceInvoiceService._build_payment_entries(line_item)
            billing_items.extend(payments_billing_items)
            total_payments += payments_total

            adjustments_total, adjustments_billing_items = ComplianceInvoiceService._build_adjustment_entries(line_item)
            billing_items.extend(adjustments_billing_items)
            total_adjustments += adjustments_total

        amount_due = (total_fee - total_payments + total_adjustments).quantize(Decimal("0.01"))
        return amount_due, billing_items

    @staticmethod
    def _build_line_item_entry(line_item: ElicensingLineItem) -> Tuple[Decimal, List[Dict[str, Any]]]:
        fee_date = line_item.fee_date.strftime("%b %-d, %Y") if line_item.fee_date else "—"
        amount = line_item.base_amount
        entry = {
            "date": fee_date,
            "description": line_item.description,
            "amount": f"${amount:,.2f}",
        }
        return amount, [entry]

    @staticmethod
    def _build_payment_entries(line_item: ElicensingLineItem) -> Tuple[Decimal, List[Dict[str, Any]]]:
        billing_items = []
        total = Decimal("0.00")

        for payment in line_item.elicensing_payments.all():
            date = payment.received_date.strftime("%b %-d, %Y") if payment.received_date else "—"
            description = getattr(payment, "description", None) or f"Payment {payment.payment_object_id}"
            amount = payment.amount
            billing_items.append(
                {
                    "date": date,
                    "description": description,
                    "amount": f"(${amount:,.2f})",
                }
            )
            total += amount

        return total, billing_items

    @staticmethod
    def _build_adjustment_entries(line_item: ElicensingLineItem) -> Tuple[Decimal, List[Dict[str, Any]]]:
        billing_items = []
        total = Decimal("0.00")

        for adjustment in line_item.elicensing_adjustments.all():
            date = adjustment.adjustment_date.strftime("%b %-d, %Y") if adjustment.adjustment_date else "—"
            description = adjustment.reason or f"Adjustment {adjustment.adjustment_object_id} ({adjustment.type})"
            amount = adjustment.amount
            billing_items.append(
                {
                    "date": date,
                    "description": description,
                    "amount": f"(${amount:,.2f})",
                }
            )
            total += amount

        return total, billing_items
