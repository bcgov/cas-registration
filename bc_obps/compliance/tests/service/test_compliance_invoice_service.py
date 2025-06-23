from datetime import datetime
from decimal import Decimal
from unittest.mock import patch, MagicMock
import pytest

from compliance.models import (
    ComplianceReportVersion,
    ComplianceReport,
    CompliancePeriod,
    ComplianceObligation,
    ElicensingInvoice,
    ElicensingLineItem,
    ElicensingPayment,
    ElicensingAdjustment,
)
from registration.models import Operation, Operator, Address
from reporting.models import ReportingYear

from compliance.service.compliance_invoice_service import ComplianceInvoiceService
from compliance.service.exceptions import ComplianceInvoiceError


pytestmark = pytest.mark.django_db


# --------- Fixtures ---------


@pytest.fixture
def mock_reporting_year():
    """Fixture for a mock ReportingYear instance."""
    year = MagicMock(spec=ReportingYear)
    year.id = 1
    year.reporting_year = 2024
    return year


# --------- Tests ---------


@patch("compliance.service.compliance_invoice_service.PDFGeneratorService.generate_pdf")
@patch(
    "compliance.service.compliance_invoice_service.ComplianceReportVersionService.get_operation_by_compliance_report_version"
)
@patch(
    "compliance.service.compliance_invoice_service.ComplianceReportVersionService.get_obligation_by_compliance_report_version"
)
@patch("compliance.service.compliance_invoice_service.ComplianceChargeRate.objects.get")
@patch(
    "compliance.service.compliance_invoice_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
)
def test_generate_invoice_pdf_success(
    mock_refresh_data,
    mock_get_charge_rate,
    mock_get_obligation,
    mock_get_operation,
    mock_generate_pdf,
    mock_reporting_year,
):
    # CompliancePeriod → ReportingYear
    mock_period = MagicMock(spec=CompliancePeriod)
    mock_period.reporting_year = mock_reporting_year

    # ComplianceReport
    mock_report = MagicMock(spec=ComplianceReport)
    mock_report.compliance_period = mock_period

    # ComplianceReportVersion
    mock_version = MagicMock(spec=ComplianceReportVersion)
    mock_version.compliance_report = mock_report
    mock_version.report_compliance_summary.excess_emissions = Decimal("150.00")

    # ComplianceObligation
    mock_obligation = MagicMock(spec=ComplianceObligation)
    mock_obligation.fee_amount_dollars = Decimal("300.00")
    mock_obligation.fee_date = datetime(2025, 6, 1)
    mock_obligation.obligation_id = "25-0001-1"
    mock_obligation.compliance_report_version = mock_version
    mock_get_obligation.return_value = mock_obligation

    # Operation + Operator
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

    # Charge rate
    mock_get_charge_rate.return_value.rate = Decimal("2.00")

    # Invoice + line items
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

    # PDF Generation
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


@patch(
    "compliance.service.compliance_invoice_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
)
def test_generate_invoice_pdf_with_stale_data_raises_error(mock_refresh_data):
    # Arrange
    mock_refresh_data.return_value.data_is_fresh = False

    # Act & Assert
    with pytest.raises(ComplianceInvoiceError) as exc_info:
        ComplianceInvoiceService.generate_invoice_pdf(compliance_report_version_id=999)

    assert str(exc_info.value) == (
        "stale_data: "
        "Invoice data could not be refreshed from Elicensing.  Please try again, or contact support if the problem persists."
    )


@pytest.mark.parametrize(
    "fee_amount, payments, adjustments, expected_due, expected_billing_count",
    [
        # Only fee
        (Decimal("300.00"), [], [], Decimal("300.00"), 1),
        # Fee with one payment
        (
            Decimal("300.00"),
            [{"amount": Decimal("100.00"), "date": "Jun 10, 2025", "description": "Partial Payment"}],
            [],
            Decimal("200.00"),
            2,
        ),
        # Fee with one adjustment
        (
            Decimal("300.00"),
            [],
            [{"amount": Decimal("50.00"), "date": "Jun 12, 2025", "description": "Rebate"}],
            Decimal("250.00"),
            2,
        ),
        # Fee with both payment and adjustment
        (
            Decimal("300.00"),
            [{"amount": Decimal("100.00"), "date": "Jun 10, 2025", "description": "Partial Payment"}],
            [{"amount": Decimal("25.00"), "date": "Jun 12, 2025", "description": "Rebate"}],
            Decimal("175.00"),
            3,
        ),
        # No line items
        (
            None,
            [],
            [],
            Decimal("0.00"),
            0,
        ),
    ],
)
def test_calculate_invoice_amount_due_parametrized(
    fee_amount, payments, adjustments, expected_due, expected_billing_count
):
    mock_invoice = MagicMock(spec=ElicensingInvoice)

    if fee_amount is not None:
        mock_fee = MagicMock(spec=ElicensingLineItem)
        mock_fee.fee_date.strftime.return_value = "Jun 1, 2025"
        mock_fee.description = "Compliance Fee"
        mock_fee.base_amount = fee_amount

        mock_fee.elicensing_payments.all.return_value = [_make_payment_mock(p) for p in payments]
        mock_fee.elicensing_adjustments.all.return_value = [_make_adjustment_mock(a) for a in adjustments]

        mock_invoice.elicensing_line_items.filter.return_value = [mock_fee]
    else:
        mock_invoice.elicensing_line_items.filter.return_value = []

    amount_due, billing_items = ComplianceInvoiceService.calculate_invoice_amount_due(mock_invoice)

    assert amount_due == expected_due
    assert len(billing_items) == expected_billing_count


def _make_payment_mock(payment_dict):
    mock_payment = MagicMock(spec=ElicensingPayment)
    mock_payment.amount = payment_dict["amount"]
    mock_payment.received_date.strftime.return_value = payment_dict["date"]
    mock_payment.description = payment_dict["description"]
    return mock_payment


def _make_adjustment_mock(adj_dict):
    mock_adjustment = MagicMock(spec=ElicensingAdjustment)
    mock_adjustment.amount = adj_dict["amount"]
    mock_adjustment.adjustment_date.strftime.return_value = adj_dict["date"]
    mock_adjustment.reason = adj_dict["description"]
    mock_adjustment.type = "CREDIT"
    return mock_adjustment
