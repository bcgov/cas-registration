import logging
from datetime import datetime
from typing import Dict, Any, Tuple, Generator
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService
from compliance.service.exceptions import ComplianceInvoiceError
from service.pdf.pdf_generator_service import PDFGeneratorService

# Type ignore for weasyprint since it lacks stubs

logger = logging.getLogger(__name__)


class PaymentInstructionsService:
    """Service for generating PDF payment instructions"""

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
        try:
            context = PaymentInstructionsService._prepare_payment_instructions_context(compliance_summary_id)
            filename = f"payment_instructions_{context['invoice_number']}_{datetime.now().strftime('%Y%m%d')}.pdf"

            return PDFGeneratorService.generate_pdf(
                template_name="payment_instructions.html",
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
    def _prepare_payment_instructions_context(complianceReportVersionID: int) -> Dict[str, Any]:
        """
        Prepare context data for the payment instructions template.

        Returns:
            Dictionary of context data for the template
        """

        refreshResult = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            complianceReportVersionID
        )

        context = {
            'invoice_number': refreshResult.invoice.invoice_number
            if refreshResult.invoice
            else "Missing Invoice Number",
        }

        return context
