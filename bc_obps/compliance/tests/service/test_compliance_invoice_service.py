from datetime import datetime
from decimal import Decimal
from unittest.mock import patch, MagicMock

import pytest

from compliance.service.compliance_invoice_service import ComplianceInvoiceService
from compliance.models import ComplianceReportVersion, ComplianceReport, CompliancePeriod, ComplianceObligation
from registration.models import Operation, Operator, Address
from compliance.models import ElicensingInvoice, ElicensingLineItem, ElicensingPayment, ElicensingAdjustment

pytestmark = pytest.mark.django_db


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
    # Mock Reporting Year → CompliancePeriod → ComplianceReport → ComplianceReportVersion
    mock_year = MagicMock(spec=ReportingYear)
    mock_year.reporting_year = 2024

    mock_period = MagicMock(spec=CompliancePeriod)
    mock_period.reporting_year = mock_year

    mock_report = MagicMock(spec=ComplianceReport)
    mock_report.compliance_period = mock_period

    mock_version = MagicMock(spec=ComplianceReportVersion)
    mock_version.compliance_report = mock_report
    mock_version.report_compliance_summary.excess_emissions = Decimal("150.00")

    # Mock ComplianceObligation
    mock_obligation = MagicMock(spec=ComplianceObligation)
    mock_obligation.fee_amount_dollars = Decimal("300.00")
    mock_obligation.fee_date = datetime(2025, 6, 1)
    mock_obligation.obligation_id = "25-0001-1"
    mock_obligation.compliance_report_version = mock_version
    mock_get_obligation.return_value = mock_obligation

    # Mock Operation and Operator
    mock_address = MagicMock(spec=Address)
    mock_address.street_address = "123 Main St"
    mock_address.municipality = "Victoria"
    mock_address.province = "BC"
    mock_address.postal_code = "V8W 1A1"

    mock_operator = MagicMock(spec=Operator)
    mock_operator.legal_name = "Test Operator"
    mock_operator.physical_address = mock_address

    mock_operation = MagicMock(spec=Operation)
    mock_operation.name = "Test Operation"
    mock_operation.operator = mock_operator
    mock_get_operation.return_value = mock_operation

    # Mock ComplianceChargeRate
    mock_get_charge_rate.return_value.rate = Decimal("2.00")

    # Mock invoice and related data
    mock_invoice = MagicMock(spec=ElicensingInvoice)
    mock_invoice.invoice_number = "INV-001"
    mock_invoice.due_date = datetime(2025, 7, 1)

    mock_line_item = MagicMock(spec=ElicensingLineItem)
    mock_line_item.fee_date = datetime(2025, 6, 1)
    mock_line_item.base_amount = Decimal("300.00")
    mock_line_item.description = "Compliance Fee"

    mock_payment = MagicMock(spec=ElicensingPayment)
    mock_payment.amount = Decimal("50.00")
    mock_payment.received_date = datetime(2025, 6, 10)
    mock_payment.description = "Partial Payment"

    mock_adjustment = MagicMock(spec=ElicensingAdjustment)
    mock_adjustment.amount = Decimal("25.00")
    mock_adjustment.adjustment_date = datetime(2025, 6, 12)
    mock_adjustment.reason = "Rebate"
    mock_adjustment.type = "CREDIT"

    mock_line_item.elicensing_payments.all.return_value = [mock_payment]
    mock_line_item.elicensing_adjustments.all.return_value = [mock_adjustment]
    mock_invoice.elicensing_line_items.filter.return_value = [mock_line_item]

    mock_refresh_data.return_value.invoice = mock_invoice
    mock_refresh_data.return_value.data_is_fresh = True

    # Mock PDF generation
    mock_generate_pdf.return_value = (b"%PDF mock", "invoice_INV-001_20250601.pdf", 2048)

    # Execute
    result = ComplianceInvoiceService.generate_invoice_pdf(compliance_report_version_id=1)

    # Assert
    assert isinstance(result, tuple)
    content, filename, size = result
    assert content.startswith(b"%PDF")
    assert filename.startswith("invoice_INV-001_")
    assert size == 2048
    mock_generate_pdf.assert_called_once()
