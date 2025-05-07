from unittest.mock import patch, MagicMock
import uuid
from compliance.service.elicensing.obligation_elicensing_service import ObligationELicensingService
import requests
from datetime import date
from decimal import Decimal

import pytest
from django.utils import timezone

from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.elicensing_link import ELicensingLink
from compliance.models.compliance_summary import ComplianceSummary
from compliance.models.compliance_period import CompliancePeriod
from reporting.models.reporting_year import ReportingYear
from registration.models.operation import Operation
from registration.models.operator import Operator


@pytest.fixture
def mock_obligation() -> MagicMock:
    """Mock a ComplianceObligation object"""
    obligation = MagicMock(spec=ComplianceObligation)
    obligation.id = 1
    obligation.fee_amount_dollars = Decimal('1000.00')
    obligation.fee_date = date(2024, 1, 1)
    obligation.obligation_deadline = date(2024, 12, 31)

    # Mock compliance summary
    mock_summary = MagicMock(spec=ComplianceSummary)
    mock_period = MagicMock(spec=CompliancePeriod)
    mock_year = MagicMock(spec=ReportingYear)
    mock_year.reporting_year = 2024
    mock_period.reporting_year = mock_year
    mock_summary.compliance_period = mock_period

    # Mock operation and operator
    mock_operation = MagicMock(spec=Operation)
    mock_operator = MagicMock(spec=Operator)
    mock_operator.id = uuid.uuid4()
    mock_operation.operator = mock_operator
    mock_summary.report.operation = mock_operation

    obligation.compliance_summary = mock_summary
    return obligation


@pytest.fixture
def mock_client_link():
    """Mock an ELicensingLink object for client"""
    link = MagicMock(spec=ELicensingLink)
    link.id = 1
    link.elicensing_guid = uuid.uuid4()
    link.elicensing_object_id = "test-client-id"
    link.elicensing_object_kind = ELicensingLink.ObjectKind.CLIENT
    link.sync_status = "SUCCESS"
    link.last_sync_at = timezone.now()
    return link


@pytest.fixture
def mock_fee_link():
    """Mock an ELicensingLink object for fee"""
    link = MagicMock(spec=ELicensingLink)
    link.id = 2
    link.elicensing_guid = uuid.uuid4()
    link.elicensing_object_id = "test-fee-id"
    link.elicensing_object_kind = ELicensingLink.ObjectKind.FEE
    link.sync_status = "SUCCESS"
    link.last_sync_at = timezone.now()
    return link


@pytest.fixture
def mock_invoice_link():
    """Mock an ELicensingLink object for invoice"""
    link = MagicMock(spec=ELicensingLink)
    link.id = 3
    link.elicensing_guid = uuid.uuid4()
    link.elicensing_object_id = "test-invoice-number"
    link.elicensing_object_kind = ELicensingLink.ObjectKind.INVOICE
    link.sync_status = "SUCCESS"
    link.last_sync_at = timezone.now()
    return link


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
        assert result["feeAmount"] == Decimal('1000.00')
        assert result["feeDate"] == "2024-01-01"

    def test_map_obligation_to_invoice_data(self, mock_obligation: MagicMock) -> None:
        """Test mapping obligation data to invoice data"""
        fee_id = "test-fee-id"
        result = ObligationELicensingService._map_obligation_to_invoice_data(mock_obligation, fee_id)

        assert result["paymentDueDate"] == "2024-12-31"
        assert result["businessAreaCode"] == "OBPS"
        assert result["fees"] == [fee_id]

    @pytest.mark.django_db
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

        # Setup API responses
        mock_fee_response = MagicMock()
        mock_fee_response.fees = [MagicMock(feeObjectId="test-fee-id", feeGUID=str(uuid.uuid4()))]
        mock_api_client.create_fees.return_value = mock_fee_response

        mock_invoice_response = MagicMock()
        mock_invoice_response.invoiceNumber = "test-invoice-number"
        mock_api_client.create_invoice.return_value = mock_invoice_response

        # Call the method
        ObligationELicensingService.process_obligation_integration(mock_obligation.id)

        # Verify all steps were called
        mock_operator_service.sync_client_with_elicensing.assert_called_once()
        mock_api_client.create_fees.assert_called_once()
        mock_api_client.create_invoice.assert_called_once()
        assert mock_link_service.create_link.call_count == 2

    @pytest.mark.django_db
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

        # Setup API response
        mock_response = MagicMock()
        mock_response.fees = [MagicMock(feeObjectId="test-fee-id", feeGUID=str(uuid.uuid4()))]
        mock_api_client.create_fees.return_value = mock_response

        # Call the method
        result = ObligationELicensingService.sync_fee_with_elicensing(mock_obligation.id, mock_client_link)

        # Verify result and calls
        assert result == mock_fee_link
        mock_api_client.create_fees.assert_called_once()
        mock_link_service.create_link.assert_called_once()

    @pytest.mark.django_db
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

        # Setup API response
        mock_response = MagicMock()
        mock_response.invoiceNumber = "test-invoice-number"
        mock_api_client.create_invoice.return_value = mock_response

        # Call the method
        result = ObligationELicensingService.sync_invoice_with_elicensing(
            mock_obligation.id, mock_client_link, mock_fee_link
        )

        # Verify result and calls
        assert result == mock_invoice_link
        mock_api_client.create_invoice.assert_called_once()
        mock_link_service.create_link.assert_called_once()

    @pytest.mark.django_db
    def test_sync_fee_with_elicensing_api_error(
        self,
        mock_obligation_get: MagicMock,
        mock_api_client: MagicMock,
        mock_link_service: MagicMock,
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

    @pytest.mark.django_db
    def test_sync_invoice_with_elicensing_api_error(
        self,
        mock_obligation_get: MagicMock,
        mock_api_client: MagicMock,
        mock_link_service: MagicMock,
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
