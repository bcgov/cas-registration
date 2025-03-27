import uuid
from unittest.mock import patch, MagicMock
import pytest
import requests
from django.contrib.contenttypes.models import ContentType
from decimal import Decimal
from django.utils import timezone

from service.fee_elicensing_service import FeeELicensingService
from service.elicensing_api_client import FeeCreationRequest, FeeCreationItem
from compliance.models import ComplianceFee, ELicensingLink, ComplianceObligation


@pytest.fixture
def mock_fee():
    """Create a mock compliance fee"""
    fee = MagicMock(spec=ComplianceFee)
    fee.id = 1
    fee.fee_amount = Decimal('25.00')
    fee.fee_date = timezone.now().date()
    fee.business_area_code = "OBPS"
    fee.fee_description = "Test Fee Description"
    fee.fee_profile_group_name = ComplianceFee.FeeProfileGroupName.EXCESS_EMISSIONS
    fee.compliance_obligation = MagicMock()
    fee.compliance_obligation.compliance_summary.report.operator = MagicMock()
    return fee


@pytest.fixture
def mock_elicensing_link():
    """Create a mock ELicensingLink"""
    link = MagicMock(spec=ELicensingLink)
    link.id = 1
    link.elicensing_object_id = "12345"
    link.elicensing_guid = uuid.uuid4()
    link.sync_status = "PENDING"
    return link


@pytest.fixture
def mock_client_link():
    """Create a mock client ELicensingLink"""
    link = MagicMock(spec=ELicensingLink)
    link.id = 2
    link.elicensing_object_id = "67890"
    return link


class TestFeeELicensingService:
    """Tests for the FeeELicensingService class"""

    def test_map_fee_to_elicensing_data_excess_emissions(self, mock_fee, mock_elicensing_link):
        """Test mapping fee data to eLicensing format with excess emissions profile"""
        # Set up the fee with EXCESS_EMISSIONS profile
        mock_fee.fee_profile_group_name = ComplianceFee.FeeProfileGroupName.EXCESS_EMISSIONS
        
        # Call the method
        result = FeeELicensingService._map_fee_to_elicensing_data(mock_fee, mock_elicensing_link)
        
        # Verify results
        assert isinstance(result, dict)
        assert "fees" in result
        assert len(result["fees"]) == 1
        
        fee_item = result["fees"][0]
        assert fee_item["businessAreaCode"] == "OBPS"
        assert fee_item["feeGUID"] == str(mock_elicensing_link.elicensing_guid)
        assert fee_item["feeProfileGroupName"] == "OBPS Compliance Obligation"
        assert fee_item["feeDescription"] == "Test Fee Description"
        assert fee_item["feeAmount"] == float(mock_fee.fee_amount)

    def test_map_fee_to_elicensing_data_administrative_penalty(self, mock_fee, mock_elicensing_link):
        """Test mapping fee data to eLicensing format with administrative penalty profile"""
        # Set up the fee with ADMINISTRATIVE_PENALTY profile
        mock_fee.fee_profile_group_name = ComplianceFee.FeeProfileGroupName.ADMINISTRATIVE_PENALTY
        
        # Call the method
        result = FeeELicensingService._map_fee_to_elicensing_data(mock_fee, mock_elicensing_link)
        
        # Verify results
        assert isinstance(result, dict)
        assert "fees" in result
        assert len(result["fees"]) == 1
        
        fee_item = result["fees"][0]
        assert fee_item["businessAreaCode"] == "OBPS"
        assert fee_item["feeGUID"] == str(mock_elicensing_link.elicensing_guid)
        assert fee_item["feeProfileGroupName"] == "OBPS Administrative Penalty"
        assert fee_item["feeDescription"] == "Test Fee Description"
        assert fee_item["feeAmount"] == float(mock_fee.fee_amount)

    def test_map_fee_to_elicensing_data_missing_description(self, mock_fee, mock_elicensing_link):
        """Test mapping fee data when description is missing"""
        # Set up the fee with blank description
        mock_fee.fee_profile_group_name = ComplianceFee.FeeProfileGroupName.EXCESS_EMISSIONS
        mock_fee.fee_description = ""
        
        # Call the method
        result = FeeELicensingService._map_fee_to_elicensing_data(mock_fee, mock_elicensing_link)
        
        # Verify results
        fee_item = result["fees"][0]
        assert fee_item["feeDescription"] == "OBPS Excess Emissions Fee"

    def test_map_fee_to_elicensing_data_invalid_profile(self, mock_fee, mock_elicensing_link):
        """Test mapping fee data with invalid profile raises ValueError"""
        # Set up the fee with invalid profile
        mock_fee.fee_profile_group_name = "INVALID_PROFILE"
        
        # Verify ValueError is raised
        with pytest.raises(ValueError) as exc_info:
            FeeELicensingService._map_fee_to_elicensing_data(mock_fee, mock_elicensing_link)
        
        # Check error message
        assert "Invalid fee profile group name" in str(exc_info.value)
        assert "INVALID_PROFILE" in str(exc_info.value)

    @pytest.mark.django_db
    @patch('service.fee_elicensing_service.ComplianceFee.objects.get')
    @patch('service.fee_elicensing_service.ELicensingLinkService.get_link_for_model')
    @patch('service.fee_elicensing_service.OperatorELicensingService.sync_client_with_elicensing')
    @patch('service.fee_elicensing_service.ELicensingLink')
    @patch('service.fee_elicensing_service.ContentType.objects.get_for_model')
    @patch('service.fee_elicensing_service.elicensing_api_client.create_fees')
    @patch('service.fee_elicensing_service.ComplianceFeeService.update_fee_status')
    def test_sync_fee_with_elicensing_success(
        self, mock_update_status, mock_create_fees, mock_get_for_model, 
        mock_elicensing_link_class, mock_sync_client, mock_get_link, 
        mock_get_fee, mock_fee, mock_elicensing_link, mock_client_link
    ):
        """Test successful syncing of fee with eLicensing"""
        # Set up mocks
        mock_get_fee.return_value = mock_fee
        mock_get_link.return_value = None  # No existing link
        mock_sync_client.return_value = mock_client_link
        
        # Mock ELicensingLink creation
        mock_elicensing_link_instance = mock_elicensing_link
        mock_elicensing_link_class.return_value = mock_elicensing_link_instance
        
        # Mock content type
        mock_content_type = MagicMock()
        mock_get_for_model.return_value = mock_content_type
        
        # Mock API response
        api_response = {
            "clientObjectId": "67890",
            "clientGUID": "abcdef",
            "fees": [
                {
                    "feeGUID": str(mock_elicensing_link_instance.elicensing_guid),
                    "feeObjectId": "fee123",
                    "feeAmount": 25.00
                }
            ]
        }
        mock_create_fees.return_value = api_response
        
        # Call the method
        result = FeeELicensingService.sync_fee_with_elicensing(1)
        
        # Verify results
        assert result == mock_elicensing_link_instance
        mock_get_fee.assert_called_once_with(id=1)
        mock_get_link.assert_called_once()
        mock_sync_client.assert_called_once()
        mock_create_fees.assert_called_once()
        mock_update_status.assert_called_once_with(1, ComplianceFee.FeeStatus.SYNCED)
        
        # Verify ELicensingLink was created and updated
        assert mock_elicensing_link_instance.elicensing_object_id == "fee123"
        assert mock_elicensing_link_instance.sync_status == "SUCCESS"
        assert mock_elicensing_link_instance.save.call_count >= 1 