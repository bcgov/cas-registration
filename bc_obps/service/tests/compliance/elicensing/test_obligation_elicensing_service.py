from unittest.mock import patch, MagicMock
import uuid
import requests
from datetime import date
from decimal import Decimal

import pytest
from django.utils import timezone

pytestmark = pytest.mark.django_db

from compliance.service.elicensing.obligation_elicensing_service import ObligationELicensingService
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.elicensing_link import ELicensingLink
from compliance.models.compliance_summary import ComplianceSummary
from compliance.models.compliance_period import CompliancePeriod
from reporting.models.reporting_year import ReportingYear
from registration.models.operation import Operation
from registration.models.operator import Operator

# Constants for test data
TEST_FEE_ID = "test-fee-id"
TEST_INVOICE_NUMBER = "test-invoice-number"
TEST_CLIENT_ID = "test-client-id"
TEST_FEE_AMOUNT = Decimal('1000.00')
TEST_FEE_DATE = date(2024, 1, 1)
TEST_DEADLINE = date(2024, 12, 31)
TEST_REPORTING_YEAR = 2024


@pytest.fixture
def mock_reporting_year() -> MagicMock:
    """Mock a ReportingYear object"""
    mock_year = MagicMock(spec=ReportingYear)
    mock_year.reporting_year = TEST_REPORTING_YEAR
    return mock_year


@pytest.fixture
def mock_compliance_period(mock_reporting_year) -> MagicMock:
    """Mock a CompliancePeriod object"""
    mock_period = MagicMock(spec=CompliancePeriod)
    mock_period.reporting_year = mock_reporting_year
    return mock_period


@pytest.fixture
def mock_operator() -> MagicMock:
    """Mock an Operator object"""
    mock_operator = MagicMock(spec=Operator)
    mock_operator.id = uuid.uuid4()
    return mock_operator


@pytest.fixture
def mock_operation(mock_operator) -> MagicMock:
    """Mock an Operation object"""
    mock_operation = MagicMock(spec=Operation)
    mock_operation.operator = mock_operator
    return mock_operation


@pytest.fixture
def mock_compliance_summary(mock_compliance_period, mock_operation) -> MagicMock:
    """Mock a ComplianceSummary object"""
    mock_summary = MagicMock(spec=ComplianceSummary)
    mock_summary.compliance_period = mock_compliance_period
    mock_summary.report.operation = mock_operation
    return mock_summary


@pytest.fixture
def mock_obligation(mock_compliance_summary) -> MagicMock:
    """Mock a ComplianceObligation object"""
    obligation = MagicMock(spec=ComplianceObligation)
    obligation.id = uuid.uuid4()
    obligation.fee_amount_dollars = TEST_FEE_AMOUNT
    obligation.fee_date = TEST_FEE_DATE
    obligation.obligation_deadline = TEST_DEADLINE
    obligation.compliance_summary = mock_compliance_summary
    return obligation


@pytest.fixture
def mock_elicensing_link(object_kind: str = "CLIENT", object_id: str = TEST_CLIENT_ID) -> MagicMock:
    """Generic fixture for creating ELicensingLink mocks"""
    link = MagicMock(spec=ELicensingLink)
    link.id = uuid.uuid4()
    link.elicensing_guid = uuid.uuid4()
    link.elicensing_object_id = object_id
    link.elicensing_object_kind = object_kind
    link.sync_status = "SUCCESS"
    link.last_sync_at = timezone.now()
    return link


@pytest.fixture
def mock_client_link(mock_elicensing_link) -> MagicMock:
    """Mock an ELicensingLink object for client"""
    return mock_elicensing_link


@pytest.fixture
def mock_fee_link(mock_elicensing_link) -> MagicMock:
    """Mock an ELicensingLink object for fee"""
    mock_elicensing_link.elicensing_object_kind = ELicensingLink.ObjectKind.FEE
    mock_elicensing_link.elicensing_object_id = TEST_FEE_ID
    return mock_elicensing_link


@pytest.fixture
def mock_invoice_link(mock_elicensing_link) -> MagicMock:
    """Mock an ELicensingLink object for invoice"""
    mock_elicensing_link.elicensing_object_kind = ELicensingLink.ObjectKind.INVOICE
    mock_elicensing_link.elicensing_object_id = TEST_INVOICE_NUMBER
    return mock_elicensing_link


@pytest.fixture
def mock_obligation_get():
    """Mock ComplianceObligation.objects.get"""
    with patch('compliance.service.elicensing.obligation_elicensing_service.ComplianceObligation.objects.get') as mock:
        yield mock


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
    mock_response = MagicMock()
    mock_response.fees = [MagicMock(feeObjectId=TEST_FEE_ID, feeGUID=str(uuid.uuid4()))]
    return mock_response


def create_mock_invoice_response():
    """Helper to create a mock invoice response"""
    mock_response = MagicMock()
    mock_response.invoiceNumber = TEST_INVOICE_NUMBER
    return mock_response


def create_mock_payment():
    """Helper to create a mock payment"""
    return MagicMock(
        paymentObjectId=uuid.uuid4(),
        receivedDate="2024-01-01",
        amount=1000.00,
        method="EFT/Wire - OBPS",
        referenceNumber="ref123",
        receiptNumber="receipt123",
    )


def create_mock_adjustment():
    """Helper to create a mock adjustment"""
    return MagicMock(adjustmentObjectId=uuid.uuid4(), date="2024-01-02", amount=-100.00, reason="Refund")


class TestObligationELicensingService:
    """Tests for the ObligationELicensingService class"""

    def test_map_obligation_to_fee_data(self, mock_obligation: MagicMock) -> None:
        """Test mapping obligation data to fee data"""
        result = ObligationELicensingService._map_obligation_to_fee_data(mock_obligation)

        assert "businessAreaCode" in result
        assert result["businessAreaCode"] == "OBPS"
        assert "feeGUID" in result
        assert result["feeProfileGroupName"] == "OBPS Compliance Obligation"
        assert result["feeDescription"] == "2024 GGIRCA Compliance Obligation"
        assert result["feeAmount"] == TEST_FEE_AMOUNT
        assert result["feeDate"] == TEST_FEE_DATE.isoformat()

    def test_map_obligation_to_invoice_data(self, mock_obligation: MagicMock) -> None:
        """Test mapping obligation data to invoice data"""
        result = ObligationELicensingService._map_obligation_to_invoice_data(mock_obligation, TEST_FEE_ID)

        assert result["paymentDueDate"] == TEST_DEADLINE.isoformat()
        assert result["businessAreaCode"] == "OBPS"
        assert result["fees"] == [TEST_FEE_ID]

    def test_process_obligation_integration_success(
        self,
        mock_obligation_get: MagicMock,
        mock_operator_service: MagicMock,
        mock_api_client: MagicMock,
        mock_link_service: MagicMock,
        mock_obligation: MagicMock,
        mock_client_link: MagicMock,
        mock_fee_link: MagicMock,
        mock_invoice_link: MagicMock,
    ) -> None:
        """Test successful full obligation integration process"""
        # Setup mocks
        mock_obligation_get.return_value = mock_obligation
        mock_operator_service.sync_client_with_elicensing.return_value = mock_client_link
        mock_link_service.create_link.side_effect = [mock_fee_link, mock_invoice_link]
        mock_api_client.create_fees.return_value = create_mock_fee_response()
        mock_api_client.create_invoice.return_value = create_mock_invoice_response()

        # Call the method
        ObligationELicensingService.process_obligation_integration(mock_obligation.id)

        # Verify all steps were called
        mock_operator_service.sync_client_with_elicensing.assert_called_once()
        mock_api_client.create_fees.assert_called_once()
        mock_api_client.create_invoice.assert_called_once()
        assert mock_link_service.create_link.call_count == 2

    def test_sync_fee_with_elicensing_success(
        self,
        mock_obligation_get: MagicMock,
        mock_api_client: MagicMock,
        mock_link_service: MagicMock,
        mock_obligation: MagicMock,
        mock_client_link: MagicMock,
        mock_fee_link: MagicMock,
    ) -> None:
        """Test successful fee sync with eLicensing"""
        # Setup mocks
        mock_obligation_get.return_value = mock_obligation
        mock_link_service.create_link.return_value = mock_fee_link
        mock_api_client.create_fees.return_value = create_mock_fee_response()

        # Call the method
        result = ObligationELicensingService.sync_fee_with_elicensing(mock_obligation.id, mock_client_link)

        # Verify result and calls
        assert result == mock_fee_link
        mock_api_client.create_fees.assert_called_once()
        mock_link_service.create_link.assert_called_once()

    def test_sync_invoice_with_elicensing_success(
        self,
        mock_obligation_get: MagicMock,
        mock_api_client: MagicMock,
        mock_link_service: MagicMock,
        mock_obligation: MagicMock,
        mock_client_link: MagicMock,
        mock_fee_link: MagicMock,
        mock_invoice_link: MagicMock,
    ) -> None:
        """Test successful invoice sync with eLicensing"""
        # Setup mocks
        mock_obligation_get.return_value = mock_obligation
        mock_link_service.create_link.return_value = mock_invoice_link
        mock_api_client.create_invoice.return_value = create_mock_invoice_response()

        # Call the method
        result = ObligationELicensingService.sync_invoice_with_elicensing(
            mock_obligation.id, mock_client_link, mock_fee_link
        )

        # Verify result and calls
        assert result == mock_invoice_link
        mock_api_client.create_invoice.assert_called_once()
        mock_link_service.create_link.assert_called_once()

    def test_sync_fee_with_elicensing_api_error(
        self,
        mock_obligation_get: MagicMock,
        mock_api_client: MagicMock,
        mock_obligation: MagicMock,
        mock_client_link: MagicMock,
    ) -> None:
        """Test fee sync handles API errors"""
        # Setup mocks
        mock_obligation_get.return_value = mock_obligation
        mock_api_client.create_fees.side_effect = requests.RequestException("API Error")

        # Call the method and expect exception
        with pytest.raises(requests.RequestException):
            ObligationELicensingService.sync_fee_with_elicensing(mock_obligation.id, mock_client_link)

    def test_sync_invoice_with_elicensing_api_error(
        self,
        mock_obligation_get: MagicMock,
        mock_api_client: MagicMock,
        mock_obligation: MagicMock,
        mock_client_link: MagicMock,
        mock_fee_link: MagicMock,
    ) -> None:
        """Test invoice sync handles API errors"""
        # Setup mocks
        mock_obligation_get.return_value = mock_obligation
        mock_api_client.create_invoice.side_effect = requests.RequestException("API Error")

        # Call the method and expect exception
        with pytest.raises(requests.RequestException):
            ObligationELicensingService.sync_invoice_with_elicensing(
                mock_obligation.id, mock_client_link, mock_fee_link
            )

    def test_get_obligation_invoice_payments_success(
        self,
        mock_obligation_get: MagicMock,
        mock_link_service: MagicMock,
        mock_api_client: MagicMock,
        mock_obligation: MagicMock,
        mock_client_link: MagicMock,
        mock_invoice_link: MagicMock,
    ) -> None:
        """Test successful retrieval of obligation invoice payments"""
        # Setup mocks
        mock_obligation_get.return_value = mock_obligation
        mock_link_service.get_link_for_model.side_effect = [mock_client_link, mock_invoice_link]

        # Setup API response
        mock_invoice = MagicMock()
        mock_fee = MagicMock()
        mock_fee.payments = [create_mock_payment()]
        mock_fee.adjustments = [create_mock_adjustment()]
        mock_invoice.fees = [mock_fee]
        mock_api_client.query_invoice.return_value = mock_invoice

        # Call the method
        result = ObligationELicensingService.get_obligation_invoice_payments(mock_obligation.id)

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
        mock_obligation_get: MagicMock,
        mock_link_service: MagicMock,
        mock_obligation: MagicMock,
    ) -> None:
        """Test handling of missing client or invoice links"""
        # Setup mocks
        mock_obligation_get.return_value = mock_obligation
        mock_link_service.get_link_for_model.side_effect = [None, None]  # Both client and invoice links are None

        # Call the method and expect exception
        with pytest.raises(ValueError, match="No client or invoice link found"):
            ObligationELicensingService.get_obligation_invoice_payments(mock_obligation.id)

    def test_get_obligation_invoice_payments_api_error(
        self,
        mock_obligation_get: MagicMock,
        mock_link_service: MagicMock,
        mock_api_client: MagicMock,
        mock_obligation: MagicMock,
        mock_client_link: MagicMock,
        mock_invoice_link: MagicMock,
    ) -> None:
        """Test handling of API errors"""
        # Setup mocks
        mock_obligation_get.return_value = mock_obligation
        mock_link_service.get_link_for_model.side_effect = [mock_client_link, mock_invoice_link]
        mock_api_client.query_invoice.side_effect = requests.RequestException("API Error")

        # Call the method and expect exception
        with pytest.raises(requests.RequestException):
            ObligationELicensingService.get_obligation_invoice_payments(mock_obligation.id)

    def test_get_obligation_invoice_payments_no_invoice(
        self,
        mock_obligation_get: MagicMock,
        mock_link_service: MagicMock,
        mock_api_client: MagicMock,
        mock_obligation: MagicMock,
        mock_client_link: MagicMock,
        mock_invoice_link: MagicMock,
    ) -> None:
        """Test handling of non-existent invoice"""
        # Setup mocks
        mock_obligation_get.return_value = mock_obligation
        mock_link_service.get_link_for_model.side_effect = [mock_client_link, mock_invoice_link]
        mock_api_client.query_invoice.return_value = None

        # Call the method
        result = ObligationELicensingService.get_obligation_invoice_payments(mock_obligation.id)

        # Verify empty result
        assert result == []
