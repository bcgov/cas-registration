import base64
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Tuple, Optional

from django.template.loader import get_template

# Type ignore for weasyprint since it lacks stubs
from weasyprint import HTML  # type: ignore


class InvoiceService:
    """Service for generating PDF invoices for compliance obligations"""

    @staticmethod
    def generate_invoice_pdf(compliance_summary_id: Optional[int] = None) -> Tuple[bytes, str]:
        """
        Generate a PDF invoice.

        Args:
            compliance_summary_id: ID of the compliance summary (not used in mock version)

        Returns:
            Tuple of (PDF bytes, filename)
        """
        context = InvoiceService._prepare_invoice_context()

        logo_path = Path(__file__).parent.parent / 'static' / 'logo.png'
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

        return pdf_file, filename

    @staticmethod
    def _prepare_invoice_context() -> Dict[str, Any]:
        """
        Prepare context data for the invoice template.

        Returns:
            Dictionary of context data for the template
        """

        invoice_number = "OBI000004"
        invoice_date = "Dec 6, 2025"
        invoice_due_date = "Jan 5, 2026"
        invoice_printed_date = "Dec 4, 2025"
        fee_date = "Dec 6, 2025"
        payments_applied = "$0.00"
        operator_name = "Colour Co."
        operator_address_line1 = "111 COLOUR ST"
        operator_address_line2 = "VANCOUVER, BC, V1V 1V1"
        operation_name = "Pink Operation"
        operation_address_line1 = "111 PINK RD"
        operation_address_line2 = "VANCOUVER, BC, V1V 1V1"
        obligation_id = "24-0001-1-1"
        penalty_amount = "$122.76"
        amount_due = "$122.76"
        fee_amount = "$122.76"
        total_amount = "$122.76"

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
            'penalty_amount': penalty_amount,
            'payments_applied': payments_applied,
            'fee_date': fee_date,
            'fee_amount': fee_amount,
            'amount_due': amount_due,
            'total_amount': total_amount,
        }

        return context
