import base64
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, Generator

from django.conf import settings
from django.template.loader import get_template

# Type ignore for weasyprint since it lacks stubs
from weasyprint import HTML  # type: ignore


class InvoiceService:
    """Service for generating PDF invoices for compliance obligations"""

    CHUNK_SIZE = 64 * 1024

    @staticmethod
    def generate_invoice_pdf(
        compliance_summary_id: Optional[int] = None,
    ) -> Tuple[Generator[bytes, None, None], str, int]:
        """
        Generate a PDF invoice and return a generator that yields chunks of the PDF data.

        Args:
            compliance_summary_id: ID of the compliance summary (not used in mock version)

        Returns:
            Tuple of (PDF data generator, filename, total_size_in_bytes)
        """
        context = InvoiceService._prepare_invoice_context()

        logo_path = Path(__file__).parent.parent / 'static' / 'logo.png'

        if hasattr(settings, 'STATIC_ROOT') and settings.STATIC_ROOT:
            static_root_logo = Path(settings.STATIC_ROOT) / 'logo.png'
            if static_root_logo.exists():
                logo_path = static_root_logo

        if logo_path.exists():
            with open(logo_path, 'rb') as f:
                logo_base64 = base64.b64encode(f.read()).decode('utf-8')
        else:
            logo_base64 = ''

        context['logo_base64'] = logo_base64

        template = get_template('invoice.html')
        html_string = template.render(context)

        pdf_file = HTML(string=html_string).write_pdf()

        filename = f"invoice_{context['invoice_number']}_{datetime.now().strftime('%Y%m%d')}.pdf"

        total_size = len(pdf_file)

        def pdf_generator() -> Generator[bytes, None, None]:
            for i in range(0, total_size, InvoiceService.CHUNK_SIZE):
                yield pdf_file[i : i + InvoiceService.CHUNK_SIZE]

        return pdf_generator(), filename, total_size

    @staticmethod
    def _prepare_invoice_context() -> Dict[str, Any]:
        """
        Prepare context data for the invoice template.

        Returns:
            Dictionary of context data for the template
        """

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
