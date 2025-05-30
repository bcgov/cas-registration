from unittest.mock import patch, MagicMock
import pytest
from django.template.exceptions import TemplateDoesNotExist
from service.pdf.pdf_generator_service import PDFGeneratorService


class TestPDFGeneratorService:
    @patch('service.pdf.pdf_generator_service.get_template')
    @patch('service.pdf.pdf_generator_service.HTML')
    def test_generate_pdf_success(self, mock_html, mock_get_template):
        # Arrange
        template_name = "test.html"
        context = {"key": "value"}
        filename = "test.pdf"
        mock_template = MagicMock()
        mock_template.render.return_value = "<html>test</html>"
        mock_get_template.return_value = mock_template
        mock_pdf = b"test pdf content"
        mock_html.return_value.write_pdf.return_value = mock_pdf

        # Act
        generator, output_filename, size = PDFGeneratorService.generate_pdf(template_name=template_name, context=context, filename=filename)

        # Assert
        mock_get_template.assert_called_once_with(template_name)
        mock_template.render.assert_called_once_with(context)
        mock_html.assert_called_once_with(string="<html>test</html>")
        mock_html.return_value.write_pdf.assert_called_once()
        assert output_filename == filename
        assert size == len(mock_pdf)
        assert b"".join(generator) == mock_pdf

    @patch('service.pdf.pdf_generator_service.get_template')
    def test_generate_pdf_template_not_found(self, mock_get_template):
        # Arrange
        mock_get_template.side_effect = TemplateDoesNotExist("test.html")

        # Act/Assert
        with pytest.raises(ValueError, match="Failed to generate PDF: template 'test.html' not found"):
            PDFGeneratorService.generate_pdf("test.html", {}, "test.pdf")

    @patch('service.pdf.pdf_generator_service.get_template')
    @patch('service.pdf.pdf_generator_service.HTML')
    def test_generate_pdf_with_logo(self, mock_html, mock_get_template):
        # Arrange
        template_name = "test.html"
        context = {"key": "value"}
        filename = "test.pdf"
        logo_file_name = "logo.png"
        mock_template = MagicMock()
        mock_template.render.return_value = "<html>test</html>"
        mock_get_template.return_value = mock_template
        mock_pdf = b"test pdf content"
        mock_html.return_value.write_pdf.return_value = mock_pdf

        # Act
        with patch.object(PDFGeneratorService, '_get_logo_base64', return_value="base64_logo") as mock_get_logo:
            generator, output_filename, size = PDFGeneratorService.generate_pdf(template_name=template_name, context=context, filename=filename, logo_file_name=logo_file_name)

        # Assert
        mock_get_logo.assert_called_once_with(logo_file_name)
        assert context["logo_base64"] == "base64_logo"
        mock_get_template.assert_called_once_with(template_name)
        mock_template.render.assert_called_once_with(context)
        mock_html.assert_called_once_with(string="<html>test</html>")
        mock_html.return_value.write_pdf.assert_called_once()
        assert output_filename == filename
        assert size == len(mock_pdf)
        assert b"".join(generator) == mock_pdf

    @patch('service.pdf.pdf_generator_service.get_template')
    @patch('service.pdf.pdf_generator_service.HTML')
    def test_generate_pdf_weasyprint_error(self, mock_html, mock_get_template):
        # Arrange
        mock_template = MagicMock()
        mock_template.render.return_value = "<html>test</html>"
        mock_get_template.return_value = mock_template
        mock_html.return_value.write_pdf.side_effect = Exception("PDF generation failed")

        # Act/Assert
        with pytest.raises(ValueError, match="Failed to generate PDF document"):
            PDFGeneratorService.generate_pdf("test.html", {}, "test.pdf")
