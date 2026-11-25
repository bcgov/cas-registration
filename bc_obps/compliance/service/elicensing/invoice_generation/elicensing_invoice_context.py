from django.utils import timezone
from decimal import ROUND_HALF_UP, Decimal
from typing import Any, Dict, Optional, Tuple

from compliance.service.elicensing.elicensing_invoice_service import STRFTIME_FORMAT
from compliance.models.elicensing_invoice import ElicensingInvoice
from compliance.constants import CLEAN_BC_LOGO_COMPLIANCE_INVOICE
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
from compliance.service.elicensing.invoice_generation.elicensing_invoice_calculator import (
    ElicensingInvoiceCalculatorService,
)
from registration.models.address import Address

"""
Elicensing_invoice_context

Helper functions for formatting data in the invoice.
"""


class ElicensingInvoiceContextService:
    @classmethod
    def _format_operator_address(cls, address: Optional[Address]) -> Tuple[str, str]:
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

    @classmethod
    def build_invoice_filename(cls, prefix: str, invoice_number: str) -> str:
        """
        Builds a human-readable, searchable invoice filename.

        Example: "OBPS Compliance Invoice OBI706800_20260619.pdf"

        Args:
            prefix: The descriptive invoice name (e.g. "OBPS Compliance Invoice").
            invoice_number: The eLicensing invoice number.

        Returns:
            The filename including the ".pdf" extension.
        """
        return f"{prefix} {invoice_number}_{timezone.now().strftime('%Y%m%d')}.pdf"

    @classmethod
    def prepare_partial_invoice_context(
        cls, compliance_report_version_id: int, invoice: ElicensingInvoice, compliance_obligation_id: str
    ) -> Dict[str, Any]:
        DATE_TODAY = timezone.now().strftime(STRFTIME_FORMAT)
        # Get operation (from report, not admin) information
        report_operation = ComplianceReportVersionService.get_report_operation_by_compliance_report_version(
            compliance_report_version_id
        )
        operator = ComplianceReportVersionService.get_operator_by_compliance_report_version(
            compliance_report_version_id
        )
        # Operator → Address
        operator_address_line1, operator_address_line2 = cls._format_operator_address(operator.mailing_address)
        invoice_number = invoice.invoice_number
        invoice_due_date = invoice.due_date.strftime(STRFTIME_FORMAT) if invoice.due_date else "—"
        amount_due, billing_items, _, _, _ = ElicensingInvoiceCalculatorService.calculate_invoice_amount_due(invoice)
        # Apply interest to the invoice if interest exists and compliance obligation is not paid yet
        if (
            invoice.invoice_interest_balance is not None
            and invoice.invoice_interest_balance > Decimal('0.00')
            and invoice.invoice_fee_balance != Decimal('0.00')
        ):
            billing_items.append(
                {
                    'date': f'{DATE_TODAY}',
                    'description': 'FAA Interest',
                    'amount': f'${invoice.invoice_interest_balance:,.2f}',
                }
            )
            amount_due += invoice.invoice_interest_balance
        total_amount_due = f"${amount_due.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP):,}"
        return {
            "operator_name": operator.legal_name,
            "operator_address_line1": operator_address_line1,
            "operator_address_line2": operator_address_line2,
            "operation_name": report_operation.operation_name,
            "invoice_number": invoice_number,
            "invoice_due_date": invoice_due_date,
            'invoice_printed_date': DATE_TODAY,
            "logo_base64": CLEAN_BC_LOGO_COMPLIANCE_INVOICE,
            'billing_items': billing_items,
            "total_amount_due": total_amount_due,
            "compliance_obligation_id": compliance_obligation_id,
        }
