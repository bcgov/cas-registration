from unittest.mock import patch
import uuid
import requests
from datetime import date
from decimal import Decimal

import pytest
from django.utils import timezone
from model_bakery import baker

from compliance.service.elicensing.obligation_elicensing_service import ObligationELicensingService
from compliance.models.elicensing_link import ELicensingLink
from reporting.models.reporting_year import ReportingYear

pytestmark = pytest.mark.django_db

# Constants for test data
TEST_FEE_ID = "test-fee-id"
TEST_INVOICE_NUMBER = "test-invoice-number"
TEST_CLIENT_ID = "test-client-id"
TEST_FEE_AMOUNT = Decimal('1000.00')
TEST_FEE_DATE = date(2024, 1, 1)
TEST_DEADLINE = date(2024, 12, 31)
TEST_REPORTING_YEAR = 2024


@pytest.fixture
def reporting_year():
    """Create a ReportingYear instance"""
    reporting_year, _ = ReportingYear.objects.get_or_create(
        reporting_year=TEST_REPORTING_YEAR,
        defaults={
            'reporting_window_start': date(2025, 1, 1),
            'reporting_window_end': date(2025, 12, 31),
            'report_due_date': date(2025, 5, 31),
            'description': 'Test reporting year',
        },
    )
    return reporting_year


@pytest.fixture
def compliance_period(reporting_year):
    """Create a CompliancePeriod instance"""
    return baker.make_recipe('compliance.tests.utils.compliance_period', reporting_year=reporting_year)


@pytest.fixture
def operator():
    """Create an Operator instance"""
    return baker.make_recipe('registration.tests.utils.operator')


@pytest.fixture
def operation(operator):
    """Create an Operation instance"""
    return baker.make_recipe('registration.tests.utils.operation', operator=operator)


@pytest.fixture
def compliance_summary(compliance_period, operation):
    """Create a ComplianceSummary instance"""
    report = baker.make_recipe('reporting.tests.utils.report', operation=operation)
    report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
    return baker.make_recipe(
        'compliance.tests.utils.compliance_summary',
        report=report,
        current_report_version=report_version,
        compliance_period=compliance_period,
    )


@pytest.fixture
def obligation(compliance_summary):
    """Create a ComplianceObligation instance"""
    return baker.make_recipe(
        'compliance.tests.utils.compliance_obligation',
        compliance_summary=compliance_summary,
        fee_amount_dollars=TEST_FEE_AMOUNT,
        fee_date=TEST_FEE_DATE,
        obligation_deadline=TEST_DEADLINE,
    )


@pytest.fixture
def elicensing_link():
    """Create an ELicensingLink instance"""
    return baker.make(
        ELicensingLink,
        elicensing_guid=uuid.uuid4(),
        elicensing_object_id=TEST_CLIENT_ID,
        elicensing_object_kind=ELicensingLink.ObjectKind.CLIENT,
        sync_status="SUCCESS",
        last_sync_at=timezone.now(),
    )


@pytest.fixture
def client_link(elicensing_link):
    """Create a client ELicensingLink instance"""
    return elicensing_link


@pytest.fixture
def fee_link(elicensing_link):
    """Create a fee ELicensingLink instance"""
    elicensing_link.elicensing_object_kind = ELicensingLink.ObjectKind.FEE
    elicensing_link.elicensing_object_id = TEST_FEE_ID
    return elicensing_link


@pytest.fixture
def invoice_link(elicensing_link):
    """Create an invoice ELicensingLink instance"""
    elicensing_link.elicensing_object_kind = ELicensingLink.ObjectKind.INVOICE
    elicensing_link.elicensing_object_id = TEST_INVOICE_NUMBER
    return elicensing_link


@pytest.fixture
def mock_operator_service():
    """Mock OperatorELicensingService"""
    with patch('compliance.service.elicensing.obligation_elicensing_service.OperatorELicensingService') as mock:
        yield mock


@pytest.fixture
def mock_link_service():
    """Mock ELicensingLinkService"""
    with patch('compliance.service.elicensing.obligation_elicensing_service.ELicensingLinkService') as mock:
        yield mock


@pytest.fixture
def mock_api_client():
    """Mock elicensing_api_client"""
    with patch('compliance.service.elicensing.obligation_elicensing_service.elicensing_api_client') as mock:
        yield mock


def create_mock_fee_response():
    """Helper to create a mock fee response"""
    mock_response = type(
        'MockResponse', (), {'fees': [type('MockFee', (), {'feeObjectId': TEST_FEE_ID, 'feeGUID': str(uuid.uuid4())})]}
    )
    return mock_response()


def create_mock_invoice_response():
    """Helper to create a mock invoice response"""
    mock_response = type('MockResponse', (), {'invoiceNumber': TEST_INVOICE_NUMBER})
    return mock_response()


def create_mock_payment():
    """Helper to create a mock payment"""
    return type(
        'MockPayment',
        (),
        {
            'paymentObjectId': uuid.uuid4(),
            'receivedDate': "2024-01-01",
            'amount': 1000.00,
            'method': "EFT/Wire - OBPS",
            'referenceNumber': "ref123",
            'receiptNumber': "receipt123",
        },
    )()


def create_mock_adjustment():
    """Helper to create a mock adjustment"""
    return type(
        'MockAdjustment',
        (),
        {'adjustmentObjectId': uuid.uuid4(), 'date': "2024-01-02", 'amount': -100.00, 'reason': "Refund"},
    )()


class TestObligationELicensingService:
    """Tests for the ObligationELicensingService class"""

    def test_map_obligation_to_fee_data(self, obligation):
        """Test mapping obligation data to fee data"""
        result = ObligationELicensingService._map_obligation_to_fee_data(obligation)

        assert "businessAreaCode" in result
        assert result["businessAreaCode"] == "OBPS"
        assert "feeGUID" in result
        assert result["feeProfileGroupName"] == "OBPS Compliance Obligation"
        assert result["feeDescription"] == "2024 GGIRCA Compliance Obligation"
        assert result["feeAmount"] == TEST_FEE_AMOUNT
        assert result["feeDate"] == TEST_FEE_DATE.isoformat()

    def test_map_obligation_to_invoice_data(self, obligation):
        """Test mapping obligation data to invoice data"""
        result = ObligationELicensingService._map_obligation_to_invoice_data(obligation, TEST_FEE_ID)

        assert result["paymentDueDate"] == TEST_DEADLINE.isoformat()
        assert result["businessAreaCode"] == "OBPS"
        assert result["fees"] == [TEST_FEE_ID]

    def test_process_obligation_integration_success(
        self,
        mock_operator_service,
        mock_api_client,
        mock_link_service,
        obligation,
        client_link,
        fee_link,
        invoice_link,
    ):
        """Test successful full obligation integration process"""
        # Setup mocks
        mock_operator_service.sync_client_with_elicensing.return_value = client_link
        mock_link_service.create_link.side_effect = [fee_link, invoice_link]
        mock_api_client.create_fees.return_value = create_mock_fee_response()
        mock_api_client.create_invoice.return_value = create_mock_invoice_response()

        # Call the method
        ObligationELicensingService.process_obligation_integration(obligation.id)

        # Verify all steps were called
        mock_operator_service.sync_client_with_elicensing.assert_called_once()
        mock_api_client.create_fees.assert_called_once()
        mock_api_client.create_invoice.assert_called_once()
        assert mock_link_service.create_link.call_count == 2

    def test_sync_fee_with_elicensing_success(
        self,
        mock_api_client,
        mock_link_service,
        obligation,
        client_link,
        fee_link,
    ):
        """Test successful fee sync with eLicensing"""
        # Setup mocks
        mock_link_service.create_link.return_value = fee_link
        mock_api_client.create_fees.return_value = create_mock_fee_response()

        # Call the method
        result = ObligationELicensingService.sync_fee_with_elicensing(obligation.id, client_link)

        # Verify result and calls
        assert result == fee_link
        mock_api_client.create_fees.assert_called_once()
        mock_link_service.create_link.assert_called_once()

    def test_sync_invoice_with_elicensing_success(
        self,
        mock_api_client,
        mock_link_service,
        obligation,
        client_link,
        fee_link,
        invoice_link,
    ):
        """Test successful invoice sync with eLicensing"""
        # Setup mocks
        mock_link_service.create_link.return_value = invoice_link
        mock_api_client.create_invoice.return_value = create_mock_invoice_response()

        # Call the method
        result = ObligationELicensingService.sync_invoice_with_elicensing(obligation.id, client_link, fee_link)

        # Verify result and calls
        assert result == invoice_link
        mock_api_client.create_invoice.assert_called_once()
        mock_link_service.create_link.assert_called_once()

    def test_sync_fee_with_elicensing_api_error(
        self,
        mock_api_client,
        obligation,
        client_link,
    ):
        """Test fee sync handles API errors"""
        # Setup mocks
        mock_api_client.create_fees.side_effect = requests.RequestException("API Error")

        # Call the method and expect exception
        with pytest.raises(requests.RequestException):
            ObligationELicensingService.sync_fee_with_elicensing(obligation.id, client_link)

    def test_sync_invoice_with_elicensing_api_error(
        self,
        mock_api_client,
        obligation,
        client_link,
        fee_link,
    ):
        """Test invoice sync handles API errors"""
        # Setup mocks
        mock_api_client.create_invoice.side_effect = requests.RequestException("API Error")

        # Call the method and expect exception
        with pytest.raises(requests.RequestException):
            ObligationELicensingService.sync_invoice_with_elicensing(obligation.id, client_link, fee_link)

    def test_get_obligation_invoice_payments_success(
        self,
        mock_link_service,
        mock_api_client,
        obligation,
        client_link,
        invoice_link,
    ):
        """Test successful retrieval of obligation invoice payments"""
        # Setup mocks
        mock_link_service.get_link_for_model.side_effect = [client_link, invoice_link]

        # Setup API response
        mock_invoice = type(
            'MockInvoice',
            (),
            {
                'fees': [
                    type(
                        'MockFee', (), {'payments': [create_mock_payment()], 'adjustments': [create_mock_adjustment()]}
                    )()
                ]
            },
        )()
        mock_api_client.query_invoice.return_value = mock_invoice

        # Call the method
        result = ObligationELicensingService.get_obligation_invoice_payments(obligation.id)

        # Verify result and calls
        assert len(result) == 2  # One payment and one adjustment
        assert result[0].paymentAmountApplied == TEST_FEE_AMOUNT
        assert result[0].paymentMethod == "EFT/Wire - OBPS"
        assert result[0].transactionType == "Payment"
        assert result[1].paymentAmountApplied == Decimal('-100.00')
        assert result[1].paymentMethod == "Adjustment"
        assert result[1].transactionType == "Payment Adjustment"

        mock_link_service.get_link_for_model.assert_called()
        mock_api_client.query_invoice.assert_called_once()

    def test_get_obligation_invoice_payments_no_links(
        self,
        mock_link_service,
        obligation,
    ):
        """Test handling of missing client or invoice links"""
        # Setup mocks
        mock_link_service.get_link_for_model.side_effect = [None, None]  # Both client and invoice links are None

        # Call the method and expect exception
        with pytest.raises(ValueError, match="No client or invoice link found"):
            ObligationELicensingService.get_obligation_invoice_payments(obligation.id)

    def test_get_obligation_invoice_payments_api_error(
        self,
        mock_link_service,
        mock_api_client,
        obligation,
        client_link,
        invoice_link,
    ):
        """Test handling of API errors"""
        # Setup mocks
        mock_link_service.get_link_for_model.side_effect = [client_link, invoice_link]
        mock_api_client.query_invoice.side_effect = requests.RequestException("API Error")

        # Call the method and expect exception
        with pytest.raises(requests.RequestException):
            ObligationELicensingService.get_obligation_invoice_payments(obligation.id)

    def test_get_obligation_invoice_payments_no_invoice(
        self,
        mock_link_service,
        mock_api_client,
        obligation,
        client_link,
        invoice_link,
    ):
        """Test handling of non-existent invoice"""
        # Setup mocks
        mock_link_service.get_link_for_model.side_effect = [client_link, invoice_link]
        mock_api_client.query_invoice.return_value = None

        # Call the method
        result = ObligationELicensingService.get_obligation_invoice_payments(obligation.id)

        # Verify empty result
        assert result == []
