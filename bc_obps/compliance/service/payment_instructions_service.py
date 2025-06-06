import base64
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Tuple, Generator
from django.contrib.staticfiles.storage import staticfiles_storage
from django.template.loader import get_template
from django.template.exceptions import TemplateDoesNotExist
from compliance.service.elicensing.obligation_elicensing_service import ObligationELicensingService

# Type ignore for weasyprint since it lacks stubs
from weasyprint import HTML  # type: ignore

logger = logging.getLogger(__name__)


class PaymentInstructionsService:
    """Service for generating PDF payment instructions"""

    CHUNK_SIZE = 64 * 1024

    @classmethod
    def generate_payment_instructions_pdf(
        cls,
        compliance_summary_id: int,
    ) -> Tuple[Generator[bytes, None, None], str, int]:
        """
        Generate a PDF payment instructions and return a generator that yields chunks of the PDF data.

        Args:
            compliance_summary_id: ID of the compliance summary

        Returns:
            Tuple of (PDF data generator, filename, total_size_in_bytes)
        """
        context = PaymentInstructionsService._prepare_payment_instructions_context(compliance_summary_id)
        context['logo_base64'] = PaymentInstructionsService._get_logo_base64('logo.png')

        try:
            template = get_template('payment_instructions.html')
        except TemplateDoesNotExist:
            logger.error("Payment Instructions template 'payment_instructions.html' not found")
            raise ValueError("Failed to generate payment instructions: template not found")

        html_string = template.render(context)

        try:
            pdf_file = HTML(string=html_string).write_pdf()
        except Exception as e:
            logger.error(f"Failed to generate PDF: {str(e)}")
            raise ValueError("Failed to generate PDF payment instructions")

        filename = f"payment_instructions_{context['invoice_number']}_{datetime.now().strftime('%Y%m%d')}.pdf"
        total_size = len(pdf_file)

        def pdf_generator() -> Generator[bytes, None, None]:
            for i in range(0, total_size, cls.CHUNK_SIZE):
                yield pdf_file[i : i + cls.CHUNK_SIZE]

        return pdf_generator(), filename, total_size

    @staticmethod
    def _prepare_payment_instructions_context(summaryID: int) -> Dict[str, Any]:
        """
        Prepare context data for the payment instructions template.

        Returns:
            Dictionary of context data for the template
        """

        invoice_number = ObligationELicensingService.get_invoice_from_summary_id(summaryID).invoiceNumber

        context = {
            'invoice_number': invoice_number,
        }

        return context

    @staticmethod
    def _get_logo_base64(static_file_name: str) -> str:
        """
        Convert a static file (e.g., logo) to a base64-encoded string.

        Args:
            static_file_name: Name of the static file (e.g., 'logo.png')

        Returns:
            Base64-encoded string of the file content, or empty string if file not found
        """
        try:
            logo_path = Path(staticfiles_storage.path(static_file_name))
            if not logo_path.exists():
                logger.warning(f"Static file '{static_file_name}' not found at {logo_path}")
                return ""
            with open(logo_path, 'rb') as f:
                return base64.b64encode(f.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Failed to load static file '{static_file_name}': {str(e)}")
            return ""
