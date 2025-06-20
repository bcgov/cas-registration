from decimal import Decimal
from datetime import date, datetime
from unittest.mock import patch, MagicMock
from model_bakery.baker import make_recipe
from compliance.service.compliance_invoice_service import ComplianceInvoiceService

from registration.models import (
    Operation,
)
from reporting.models import (
    Report,
)

import pytest

pytestmark = pytest.mark.django_db  # This is used to mark a test function as requiring the database

@patch("compliance.service.compliance_invoice_service.PDFGeneratorService.generate_pdf")
@patch("compliance.service.compliance_invoice_service.ComplianceReportVersionService.get_operation_by_compliance_report_version")
@patch("compliance.service.compliance_invoice_service.ComplianceReportVersionService.get_obligation_by_compliance_report_version")
@patch("compliance.service.compliance_invoice_service.ComplianceChargeRate.objects.get")
@patch("compliance.service.compliance_invoice_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id")
def test_generate_invoice_pdf_success(
    mock_refresh_data,
    mock_get_charge_rate,
    mock_get_obligation,
    mock_get_operation,
    mock_generate_pdf,
):
    # Mock ElicensingInvoice and returned data
    mock_invoice = MagicMock()
    mock_invoice.invoice_number = "INV-001"
    mock_invoice.due_date = datetime(2025, 7, 1)
    mock_invoice.elicensing_line_items.filter.return_value = []

    mock_refresh_data.return_value = (True, mock_invoice)

    # Mock obligation and its chain
    mock_obligation = MagicMock()
    mock_obligation.fee_amount_dollars = Decimal("100.00")
    mock_obligation.fee_date = datetime(2025, 6, 1)
    mock_obligation.obligation_id = "25-0001-1"

    mock_reporting_year = MagicMock()
    mock_reporting_year.reporting_year = 2025
    mock_period = MagicMock(reporting_year=mock_reporting_year)
    mock_report = MagicMock(compliance_period=mock_period)
    mock_version = MagicMock(compliance_report=mock_report)
    mock_obligation.compliance_report_version = mock_version
    mock_get_obligation.return_value = mock_obligation

    # Mock charge rate
    mock_charge_rate = MagicMock(rate=Decimal("2.00"))
    mock_get_charge_rate.return_value = mock_charge_rate

    # Mock operation and operator
    mock_operator_address = MagicMock(
        street_address="123 Main St",
        municipality="Testville",
        province="BC",
        postal_code="V1V 1V1",
    )
    mock_operator = MagicMock(
        legal_name="Test Operator",
        physical_address=mock_operator_address,
    )
    mock_operation = MagicMock(name="Test Operation", operator=mock_operator)
    mock_get_operation.return_value = mock_operation

    # Mock PDF output
    mock_generate_pdf.return_value = (b"%PDF content", "invoice_INV-001_20250601.pdf", 2048)

    # Execute
    result = ComplianceInvoiceService.generate_invoice_pdf(123)

    # Assert result structure
    assert isinstance(result, tuple)
    content, filename, size = result
    assert content.startswith(b"%PDF")
    assert filename.startswith("invoice_INV-001_")
    assert size == 2048
    mock_generate_pdf.assert_called_once()


# @patch("compliance.service.compliance_invoice_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id")
# @patch("compliance.service.compliance_invoice_service.PDFGeneratorService.generate_pdf")
# def test_generate_invoice_pdf_with_db_data(
#     mock_generate_pdf,
#     mock_refresh_data,
# ):
#     # Setup full test data using recipes
#     obligation = make_recipe("compliance.tests.utils.compliance_obligation")

#     # Attach invoice with explicit due_date to avoid .strftime(None) error
#     invoice = make_recipe(
#         "compliance.tests.utils.elicensing_invoice",
#         due_date=date(2025, 7, 1),
#     )
#     obligation.elicensing_invoice = invoice
#     obligation.save()

#     # Update related reporting year and operation info
#     compliance_report = obligation.compliance_report_version.compliance_report
#     Report.objects.filter(id=compliance_report.report.id).update(reporting_year=2025)
#     Operation.objects.filter(id=compliance_report.report.operation_id).update(
#         bc_obps_regulated_operation=make_recipe("registration.tests.utils.boro_id"),
#         status=Operation.Statuses.REGISTERED,
#     )

#     # Mock dependencies
#     mock_refresh_data.return_value = (True, invoice)
#     mock_generate_pdf.return_value = (b"%PDF bytes", "invoice_test.pdf", 1234)

#     # Execute
#     result = ComplianceInvoiceService.generate_invoice_pdf(
#         obligation.compliance_report_version.id
#     )

#     # Assert
#     assert isinstance(result, tuple)
#     content, filename, size = result
#     assert content.startswith(b"%PDF")
#     assert filename.startswith("invoice_")
#     assert size == 1234
#     mock_generate_pdf.assert_called_once()