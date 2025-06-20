from datetime import datetime
from typing import Dict, Any, List, Tuple, Generator
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
    ReportingYear,
)
from compliance.models import (
    ComplianceReport,
    ComplianceReportVersion,
    CompliancePeriod,
    ComplianceObligation,
    ElicensingInvoice,
    ElicensingLineItem,
    ElicensingPayment,
    ElicensingAdjustment,
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
            _data_is_fresh: bool
            invoice: ElicensingInvoice
            _data_is_fresh, invoice = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
                compliance_report_version_id
            )
            
            # Get invoice data
            invoice_number = invoice.invoice_number
            invoice_due_date = (
                invoice.due_date.strftime("%b %-d, %Y")
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
            operator_address: Address = operator.physical_address
            if operator_address:
                operator_address_line1 = operator_address.street_address
                operator_address_line2 = ", ".join(
                    filter(
                        None,
                        [
                            operator_address.municipality,
                            operator_address.province,
                            operator_address.postal_code,
                        ],
                    )
                )
            else:
                operator_address_line1 = ""
                operator_address_line2 = ""


            # Get obligation amounts
            # compliance_report_version_id  → ComplianceObligation
            compliance_obligation: ComplianceObligation = ComplianceReportVersionService.get_obligation_by_compliance_report_version(
                compliance_report_version_id
            )
            compliance_obligation_id = compliance_obligation.obligation_id
            invoice_date = (
                compliance_obligation.fee_date.strftime("%b %-d, %Y")
            )
            # ComplianceObligation  → ComplianceReportVersion
            compliance_report_version: ComplianceReportVersion = compliance_obligation.compliance_report_version
            # ComplianceReportVersion → ComplianceReport
            compliance_report: ComplianceReport = compliance_report_version.compliance_report
            # ComplianceReport → CompliancePeriod
            compliance_period: CompliancePeriod = compliance_report.compliance_period
            # CompliancePeriod → Reporting Year
            reporting_year: ReportingYear = compliance_period.reporting_year
            compliance_obligation_reporting_year = reporting_year.reporting_year
            # Reporting Year → ComplianceChargeRate
            charge_rate: ComplianceChargeRate = ComplianceChargeRate.objects.get(reporting_year=reporting_year)
            charge_rate_decimal: Decimal = charge_rate.rate

            # Compute obligation amounts (compliance_obligation fee × compliance_charge_rate rate)
            base_fee: Decimal = compliance_obligation.fee_amount_dollars
            raw_equivalent = base_fee * charge_rate_decimal
            equivalent_amount_decimal = raw_equivalent.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            compliance_obligation_equivalent_amount = f"${equivalent_amount_decimal:,.2f}"
            compliance_obligation_charge_rate = f"${charge_rate_decimal:,.2f} / tCO₂e"
            compliance_obligation_fee_amount_dollars = f"{base_fee:,.4f} tCO₂e"

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
                "compliance_obligation_year": compliance_obligation_reporting_year,
                "compliance_obligation_id": compliance_obligation_id,
                "compliance_obligation": compliance_obligation_fee_amount_dollars,
                "compliance_obligation_charge_rate": compliance_obligation_charge_rate,
                "compliance_obligation_equivalent_amount": compliance_obligation_equivalent_amount,
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
            print(f"[ERROR] Exception occurred during invoice generation: {exc}")
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

        for fee in fee_line_items:
            fee_date = fee.created_at.strftime("%b %-d, %Y")
            fee_description = "Fee"
            fee_amount = Decimal("0.00")
            billing_items.append({
                "date": fee_date,
                "description": fee_description,
                "amount": f"${fee_amount:,.2f}",
            })
            total_fee += fee_amount

            for payment in fee.elicensing_payments.all():
                payment_amount = payment.amount
                payment_date = payment.received_date.strftime("%b %-d, %Y")
                payment_description = f"Payment {payment.payment_object_id}"
                billing_items.append({
                    "date": payment_date,
                    "description": payment_description,
                    "amount": f"-${payment_amount:,.2f}",
                })
                total_payments += payment_amount

            for adjustment in fee.elicensing_adjustments.all():
                adjustment_amount = adjustment.amount
                adjustment_date = adjustment.adjustment_date.strftime("%b %-d, %Y")
                adjustment_description = f"Adjustment {adjustment.adjustment_object_id} ({adjustment.type})"
                billing_items.append({
                    "date": adjustment_date,
                    "description": adjustment_description,
                    "amount": f"-${adjustment_amount:,.2f}",
                })
                total_adjustments += adjustment_amount


        amount_due = (total_fee - total_payments - total_adjustments).quantize(Decimal("0.01"))

        return amount_due, billing_items