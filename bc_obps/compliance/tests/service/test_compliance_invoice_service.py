# from unittest.mock import patch
# from datetime import datetime
# from compliance.service.compliance_invoice_service import ComplianceInvoiceService


# class TestComplianceInvoiceService:
#     def test_prepare_invoice_context(self):
#         # TODO: Replace this test with a test that uses the real data from the database
#         # Act
#         context = ComplianceInvoiceService.prepare_invoice_context()

#         # Assert
#         assert isinstance(context, dict)
#         assert context['invoice_number'] == "OBI000004"
#         assert context['invoice_date'] == "Dec 6, 2025"
#         assert context['invoice_due_date'] == "Jan 5, 2026"
#         assert context['invoice_printed_date'] == "Dec 4, 2025"
#         assert context['operator_name'] == "Colour Co."
#         assert context['operator_address_line1'] == "111 COLOUR ST"
#         assert context['operator_address_line2'] == "VANCOUVER, BC, V1V 1V1"
#         assert context['operation_name'] == "Pink Operation"
#         assert context['operation_address_line1'] == "111 PINK RD"
#         assert context['operation_address_line2'] == "VANCOUVER, BC, V1V 1V1"
#         assert context['obligation_id'] == "24-0001-1-1"
#         assert context['fee_date'] == "Dec 6, 2025"
#         assert context['fee_amount'] == "$16,000.00"
#         assert context['amount_due'] == "$16,000.00"
#         assert context['total_amount'] == "$16,000.00"
#         assert context['compliance_obligation'] == "200.0000"
#         assert context['equivalent_amount'] == "$16,000.00"

#     @patch('service.pdf.pdf_generator_service.PDFGeneratorService.generate_pdf')
#     def test_generate_invoice_pdf(self, mock_generate_pdf):
#         # Arrange
#         compliance_report_version_id = 123
#         expected_context = ComplianceInvoiceService.prepare_invoice_context()
#         expected_filename = f"invoice_{expected_context['invoice_number']}_{datetime.now().strftime('%Y%m%d')}.pdf"
#         mock_pdf_data = (b"PDF content", expected_filename, 100)
#         mock_generate_pdf.return_value = mock_pdf_data

#         # Act
#         result = ComplianceInvoiceService.generate_invoice_pdf(compliance_report_version_id)

#         # Assert
#         mock_generate_pdf.assert_called_once_with(
#             template_name='invoice.html',
#             context=expected_context,
#             filename=expected_filename,
#             logo_file_name='logo.png',
#         )
#         assert result == mock_pdf_data
from decimal import Decimal
from datetime import datetime
from unittest.mock import patch, MagicMock
import pytest

from compliance.service.compliance_invoice_service import ComplianceInvoiceService


@pytest.mark.django_db
@patch("compliance.service.compliance_invoice_service.PDFGeneratorService.generate_pdf")
@patch("compliance.service.compliance_invoice_service.ComplianceReportVersionService.get_operation_by_compliance_report_version")
@patch("compliance.service.compliance_invoice_service.ComplianceReportVersionService.get_obligation_by_compliance_report_version")
@patch("compliance.service.compliance_invoice_service.ComplianceChargeRate.objects.get")
@patch("compliance.service.compliance_invoice_service.ObligationELicensingService._get_obligation_invoice")
def test_generate_invoice_pdf_success(
    mock_get_invoice,
    mock_get_charge_rate,
    mock_get_obligation,
    mock_get_operation,
    mock_generate_pdf,
):
    # Mock operation and operator
    mock_operator_address = MagicMock()
    mock_operator_address.street_address = "123 Main St"
    mock_operator_address.municipality = "Testville"
    mock_operator_address.province = "BC"
    mock_operator_address.postal_code = "V1V 1V1"

    mock_operator = MagicMock()
    mock_operator.legal_name = "Test Operator"
    mock_operator.mailing_address = mock_operator_address

    mock_operation = MagicMock()
    mock_operation.name = "Test Operation"
    mock_operation.operator = mock_operator
    mock_get_operation.return_value = mock_operation

    # Mock compliance obligation
    mock_fee_date = datetime(2025, 6, 1)
    mock_obligation = MagicMock()
    mock_obligation.fee_amount_dollars = Decimal("100.00")
    mock_obligation.fee_date = mock_fee_date
    mock_obligation.obligation_id = "25-0001-1"
    mock_obligation.obligation_deadline = None

    # Mock compliance report version
    mock_reporting_year = MagicMock()
    mock_reporting_year.reporting_year = 2025
    mock_period = MagicMock()
    mock_period.reporting_year = mock_reporting_year
    mock_report = MagicMock()
    mock_report.compliance_period = mock_period
    mock_version = MagicMock()
    mock_version.compliance_report = mock_report
    mock_obligation.compliance_report_version = mock_version
    mock_get_obligation.return_value = mock_obligation

    # Mock charge rate
    mock_charge_rate = MagicMock()
    mock_charge_rate.rate = Decimal("2.00")
    mock_get_charge_rate.return_value = mock_charge_rate

    # Mock invoice
    mock_invoice = MagicMock()
    mock_invoice.invoiceNumber = "INV-123"
    mock_invoice.invoicePaymentDueDate = "2025-07-01"
    mock_invoice.fees = []
    mock_get_invoice.return_value = mock_invoice

    # Mock PDF generation
    dummy_pdf = (b"%PDF", "invoice_INV-123_20250601.pdf", 1024)
    mock_generate_pdf.return_value = dummy_pdf

    # Call method under test
    result = ComplianceInvoiceService.generate_invoice_pdf(123)

    # Assert
    assert isinstance(result, tuple)
    pdf_generator, filename, size = result
    assert isinstance(pdf_generator, bytes)
    assert filename.startswith("invoice_INV-123_")
    assert size == 1024
    mock_generate_pdf.assert_called_once()
