import uuid
from unittest.mock import patch, MagicMock
import pytest
import requests

from service.obligation_elicensing_service import ObligationELicensingService
from compliance.models import ComplianceObligation, ComplianceFee
from service.fee_elicensing_service import FeeELicensingService


@pytest.fixture
def mock_obligation():
    """Create a mock compliance obligation"""
    obligation = MagicMock(spec=ComplianceObligation)
    obligation.id = 1
    return obligation


@pytest.fixture
def mock_fee():
    """Create a mock compliance fee"""
    fee = MagicMock(spec=ComplianceFee)
    fee.id = 1
    return fee


@pytest.fixture
def mock_elicensing_link():
    """Create a mock ELicensingLink"""
    link = MagicMock()
    link.id = 1
    link.elicensing_object_id = "12345"
    return link


class TestObligationELicensingService:
    """Tests for the ObligationELicensingService class"""

    @pytest.mark.django_db
    @patch('service.obligation_elicensing_service.ComplianceObligation.objects.get')
    @patch('service.obligation_elicensing_service.ComplianceFee.objects.filter')
    @patch('service.obligation_elicensing_service.FeeELicensingService.sync_fee_with_elicensing')
    def test_process_obligation_integration_success_existing_fee(
        self, mock_sync_fee, mock_filter_fees, mock_get_obligation, mock_obligation, mock_fee, mock_elicensing_link
    ):
        """Test successful processing of an obligation with existing fee"""
        # Set up mocks
        mock_get_obligation.return_value = mock_obligation
        
        # Mock existing fee
        mock_fees_queryset = MagicMock()
        mock_fees_queryset.exists.return_value = True
        mock_fees_queryset.first.return_value = mock_fee
        mock_filter_fees.return_value = mock_fees_queryset
        
        # Mock successful fee sync
        mock_sync_fee.return_value = mock_elicensing_link
        
        # Call the method
        result = ObligationELicensingService.process_obligation_integration(1)
        
        # Verify results
        assert result is True
        mock_get_obligation.assert_called_once_with(id=1)
        mock_filter_fees.assert_called_once_with(compliance_obligation_id=1)
        mock_sync_fee.assert_called_once_with(mock_fee.id)

    @pytest.mark.django_db
    @patch('service.obligation_elicensing_service.ComplianceObligation.objects.get')
    @patch('service.obligation_elicensing_service.ComplianceFee.objects.filter')
    @patch('service.obligation_elicensing_service.ComplianceFeeService.create_compliance_fee')
    @patch('service.obligation_elicensing_service.FeeELicensingService.sync_fee_with_elicensing')
    def test_process_obligation_integration_success_new_fee(
        self, mock_sync_fee, mock_create_fee, mock_filter_fees, mock_get_obligation, 
        mock_obligation, mock_fee, mock_elicensing_link
    ):
        """Test successful processing of an obligation with new fee creation"""
        # Set up mocks
        mock_get_obligation.return_value = mock_obligation
        
        # Mock no existing fee
        mock_fees_queryset = MagicMock()
        mock_fees_queryset.exists.return_value = False
        mock_filter_fees.return_value = mock_fees_queryset
        
        # Mock successful fee creation and sync
        mock_create_fee.return_value = mock_fee
        mock_sync_fee.return_value = mock_elicensing_link
        
        # Call the method
        result = ObligationELicensingService.process_obligation_integration(1)
        
        # Verify results
        assert result is True
        mock_get_obligation.assert_called_once_with(id=1)
        mock_filter_fees.assert_called_once_with(compliance_obligation_id=1)
        mock_create_fee.assert_called_once_with(1)
        mock_sync_fee.assert_called_once_with(mock_fee.id)

    @pytest.mark.django_db
    @patch('service.obligation_elicensing_service.ComplianceObligation.objects.get')
    def test_process_obligation_integration_obligation_not_found(
        self, mock_get_obligation
    ):
        """Test processing when obligation doesn't exist"""
        # Mock obligation not found
        mock_get_obligation.side_effect = ComplianceObligation.DoesNotExist
        
        # Call the method
        result = ObligationELicensingService.process_obligation_integration(999)
        
        # Verify results
        assert result is False
        mock_get_obligation.assert_called_once_with(id=999)

    @pytest.mark.django_db
    @patch('service.obligation_elicensing_service.ComplianceObligation.objects.get')
    @patch('service.obligation_elicensing_service.ComplianceFee.objects.filter')
    @patch('service.obligation_elicensing_service.ComplianceFeeService.create_compliance_fee')
    def test_process_obligation_integration_fee_creation_fails(
        self, mock_create_fee, mock_filter_fees, mock_get_obligation, mock_obligation
    ):
        """Test processing when fee creation fails"""
        # Set up mocks
        mock_get_obligation.return_value = mock_obligation
        
        # Mock no existing fee
        mock_fees_queryset = MagicMock()
        mock_fees_queryset.exists.return_value = False
        mock_filter_fees.return_value = mock_fees_queryset
        
        # Mock failed fee creation
        mock_create_fee.return_value = None
        
        # Call the method
        result = ObligationELicensingService.process_obligation_integration(1)
        
        # Verify results
        assert result is False
        mock_get_obligation.assert_called_once_with(id=1)
        mock_filter_fees.assert_called_once_with(compliance_obligation_id=1)
        mock_create_fee.assert_called_once_with(1)

    @pytest.mark.django_db
    @patch('service.obligation_elicensing_service.ComplianceObligation.objects.get')
    @patch('service.obligation_elicensing_service.ComplianceFee.objects.filter')
    @patch('service.obligation_elicensing_service.FeeELicensingService.sync_fee_with_elicensing')
    def test_process_obligation_integration_sync_fails(
        self, mock_sync_fee, mock_filter_fees, mock_get_obligation, mock_obligation, mock_fee
    ):
        """Test processing when fee sync fails"""
        # Set up mocks
        mock_get_obligation.return_value = mock_obligation
        
        # Mock existing fee
        mock_fees_queryset = MagicMock()
        mock_fees_queryset.exists.return_value = True
        mock_fees_queryset.first.return_value = mock_fee
        mock_filter_fees.return_value = mock_fees_queryset
        
        # Mock failed fee sync
        mock_sync_fee.return_value = None
        
        # Call the method
        result = ObligationELicensingService.process_obligation_integration(1)
        
        # Verify results
        assert result is False
        mock_get_obligation.assert_called_once_with(id=1)
        mock_filter_fees.assert_called_once_with(compliance_obligation_id=1)
        mock_sync_fee.assert_called_once_with(mock_fee.id)

    @pytest.mark.django_db
    @patch('service.obligation_elicensing_service.ComplianceObligation.objects.get')
    @patch('service.obligation_elicensing_service.ComplianceFee.objects.filter')
    @patch('service.obligation_elicensing_service.FeeELicensingService.sync_fee_with_elicensing')
    def test_process_obligation_integration_request_exception(
        self, mock_sync_fee, mock_filter_fees, mock_get_obligation, mock_obligation, mock_fee
    ):
        """Test processing handling RequestException"""
        # Set up mocks
        mock_get_obligation.return_value = mock_obligation
        
        # Mock existing fee
        mock_fees_queryset = MagicMock()
        mock_fees_queryset.exists.return_value = True
        mock_fees_queryset.first.return_value = mock_fee
        mock_filter_fees.return_value = mock_fees_queryset
        
        # Mock RequestException during sync
        mock_sync_fee.side_effect = requests.RequestException("API error")
        
        # Call the method
        result = ObligationELicensingService.process_obligation_integration(1)
        
        # Verify results
        assert result is False
        mock_get_obligation.assert_called_once_with(id=1)
        mock_filter_fees.assert_called_once_with(compliance_obligation_id=1)
        mock_sync_fee.assert_called_once_with(mock_fee.id) 