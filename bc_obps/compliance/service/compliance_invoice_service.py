from datetime import datetime
from typing import Dict, Any, Tuple, Generator
from service.pdf.pdf_generator_service import PDFGeneratorService


class ComplianceInvoiceService:
    """Service for generating PDF invoices for compliance obligations"""

    CHUNK_SIZE = 64 * 1024

    @classmethod
    def generate_invoice_pdf(
        cls,
        compliance_report_version_id: int,
    ) -> Tuple[Generator[bytes, None, None], str, int]:
        """
        Generate a PDF invoice and return a generator that yields chunks of the PDF data.

        Args:
            compliance_report_version_id: ID of the compliance report version(for now we are mocking the data and not using the id)

        Returns:
            Tuple of (PDF data generator, filename, total_size_in_bytes)
        """
        context = ComplianceInvoiceService._prepare_invoice_context()
        filename = f"invoice_{context['invoice_number']}_{datetime.now().strftime('%Y%m%d')}.pdf"

        return PDFGeneratorService.generate_pdf(
            template_name='invoice.html', context=context, filename=filename, logo_file_name='logo.png'
        )

    @staticmethod
    def _prepare_invoice_context() -> Dict[str, Any]:
        EQUIVALENT_AMOUNT = "$16,000.00"

        invoice_number = "OBI000004"
        invoice_date = "Dec 6, 2025"
        invoice_due_date = "Jan 5, 2026"
        invoice_printed_date = "Dec 4, 2025"
        fee_date = "Dec 6, 2025"
        operator_name = "Colour Co."
        operator_address_line1 = "111 COLOUR ST"
        operator_address_line2 = "VANCOUVER, BC, V1V 1V1"
        operation_name = "Pink Operation"
        operation_address_line1 = "111 PINK RD"
        operation_address_line2 = "VANCOUVER, BC, V1V 1V1"
        obligation_id = "24-0001-1-1"
        amount_due = EQUIVALENT_AMOUNT
        fee_amount = EQUIVALENT_AMOUNT
        total_amount = EQUIVALENT_AMOUNT
        compliance_obligation = "200.0000"
        equivalent_amount = "$16,000.00"

        context = {
            'invoice_number': invoice_number,
            'invoice_date': invoice_date,
            'invoice_due_date': invoice_due_date,
            'invoice_printed_date': invoice_printed_date,
            'operator_name': operator_name,
            'operator_address_line1': operator_address_line1,
            'operator_address_line2': operator_address_line2,
            'operation_name': operation_name,
            'operation_address_line1': operation_address_line1,
            'operation_address_line2': operation_address_line2,
            'obligation_id': obligation_id,
            'fee_date': fee_date,
            'fee_amount': fee_amount,
            'amount_due': amount_due,
            'total_amount': total_amount,
            'compliance_obligation': compliance_obligation,
            'equivalent_amount': equivalent_amount,
        }

        return context
