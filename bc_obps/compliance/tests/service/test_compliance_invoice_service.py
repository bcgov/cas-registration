from unittest.mock import patch
from datetime import datetime
from compliance.service.compliance_invoice_service import ComplianceInvoiceService


class TestComplianceInvoiceService:

    def test_prepare_invoice_context(self):
        # TODO: Replace this test with a test that uses the real data from the database
        # Act
        context = ComplianceInvoiceService._prepare_invoice_context()

        # Assert
        assert isinstance(context, dict)
        assert context['invoice_number'] == "OBI000004"
        assert context['invoice_date'] == "Dec 6, 2025"
        assert context['invoice_due_date'] == "Jan 5, 2026"
        assert context['invoice_printed_date'] == "Dec 4, 2025"
        assert context['operator_name'] == "Colour Co."
        assert context['operator_address_line1'] == "111 COLOUR ST"
        assert context['operator_address_line2'] == "VANCOUVER, BC, V1V 1V1"
        assert context['operation_name'] == "Pink Operation"
        assert context['operation_address_line1'] == "111 PINK RD"
        assert context['operation_address_line2'] == "VANCOUVER, BC, V1V 1V1"
        assert context['obligation_id'] == "24-0001-1-1"
        assert context['fee_date'] == "Dec 6, 2025"
        assert context['fee_amount'] == "$16,000.00"
        assert context['amount_due'] == "$16,000.00"
        assert context['total_amount'] == "$16,000.00"
        assert context['compliance_obligation'] == "200.0000"
        assert context['equivalent_amount'] == "$16,000.00"

    @patch('service.pdf.pdf_generator_service.PDFGeneratorService.generate_pdf')
    def test_generate_invoice_pdf(self, mock_generate_pdf):
        # Arrange
        compliance_report_version_id = 123
        expected_context = ComplianceInvoiceService._prepare_invoice_context()
        expected_filename = f"invoice_{expected_context['invoice_number']}_{datetime.now().strftime('%Y%m%d')}.pdf"
        mock_pdf_data = (b"PDF content", expected_filename, 100)
        mock_generate_pdf.return_value = mock_pdf_data

        # Act
        result = ComplianceInvoiceService.generate_invoice_pdf(compliance_report_version_id)

        # Assert
        mock_generate_pdf.assert_called_once_with(template_name='invoice.html', context=expected_context, filename=expected_filename, logo_file_name='logo.png')
        assert result == mock_pdf_data
