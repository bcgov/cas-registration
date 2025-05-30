import base64
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, Generator
from django.contrib.staticfiles.storage import staticfiles_storage
from django.template.loader import get_template
from django.template.exceptions import TemplateDoesNotExist
from weasyprint import HTML  # type: ignore

logger = logging.getLogger(__name__)


class PDFGeneratorService:
    """Service for generating PDF documents from HTML templates"""

    CHUNK_SIZE = 64 * 1024

    @classmethod
    def generate_pdf(
        cls,
        template_name: str,
        context: Dict[str, Any],
        filename: str,
        logo_file_name: Optional[str] = None,
    ) -> Tuple[Generator[bytes, None, None], str, int]:
        """
        Generate a PDF document from an HTML template and return a generator that yields chunks of the PDF data.

        Args:
            template_name: Name of the HTML template to use (e.g., 'invoice.html')
            context: Dictionary of context data for the template
            filename: Name of the output PDF file
            logo_file_name: Optional name of a logo file to include as base64 in the context

        Returns:
            Tuple of (PDF data generator, filename, total_size_in_bytes)

        Raises:
            ValueError: If template is not found or PDF generation fails
        """
        if logo_file_name:
            context['logo_base64'] = cls._get_logo_base64(logo_file_name)

        try:
            template = get_template(template_name)
        except TemplateDoesNotExist:
            logger.error(f"Template '{template_name}' not found")
            raise ValueError(f"Failed to generate PDF: template '{template_name}' not found")

        html_string = template.render(context)

        try:
            pdf_file = HTML(string=html_string).write_pdf()
        except Exception as e:
            logger.error(f"Failed to generate PDF: {str(e)}")
            raise ValueError("Failed to generate PDF document")

        total_size = len(pdf_file) if pdf_file else 0

        def pdf_generator() -> Generator[bytes, None, None]:
            for i in range(0, total_size, cls.CHUNK_SIZE):
                yield pdf_file[i : i + cls.CHUNK_SIZE] if pdf_file else b""

        return pdf_generator(), filename, total_size

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
