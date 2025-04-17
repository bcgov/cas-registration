from unittest.mock import patch, MagicMock
import uuid
import requests

import pytest
from django.utils import timezone

from service.compliance.elicensing.operator_elicensing_service import OperatorELicensingService
from registration.models.operator import Operator
from compliance.models.elicensing_link import ELicensingLink


@pytest.fixture
def mock_operator():
    """Mock an Operator object"""
    operator = MagicMock(spec=Operator)
    operator.id = uuid.uuid4()
    operator.legal_name = "Test Operator Ltd."
    operator.trade_name = "Test Operator"
    operator.bc_corporate_registry_number = "BC1234567"

    # Mock address
    mock_address = MagicMock()
    mock_address.street_address = "123 Test St"
    mock_address.municipality = "Test City"
    mock_address.province = "BC"
    mock_address.postal_code = "V1A 1A1"

    operator.physical_address = mock_address
    operator.mailing_address = None

    return operator


@pytest.fixture
def mock_operator_no_addresses():
    """Mock an Operator object without addresses"""
    operator = MagicMock(spec=Operator)
    operator.id = uuid.uuid4()
    operator.legal_name = "Test Operator Ltd."
    operator.trade_name = "Test Operator"
    operator.bc_corporate_registry_number = "BC1234567"

    operator.physical_address = None
    operator.mailing_address = None

    return operator


@pytest.fixture
def mock_operator_mailing_only():
    """Mock an Operator object with only mailing address"""
    operator = MagicMock(spec=Operator)
    operator.id = uuid.uuid4()
    operator.legal_name = "Test Operator Ltd."
    operator.trade_name = "Test Operator"
    operator.bc_corporate_registry_number = "BC1234567"

    # Mock address
    mock_address = MagicMock()
    mock_address.street_address = "456 Mail St"
    mock_address.municipality = "Mail City"
    mock_address.province = "BC"
    mock_address.postal_code = "V2B 2B2"

    operator.physical_address = None
    operator.mailing_address = mock_address

    return operator


@pytest.fixture
def mock_elicensing_link():
    """Mock an ELicensingLink object"""
    link = MagicMock(spec=ELicensingLink)
    link.id = 1
    link.elicensing_guid = uuid.uuid4()
    link.elicensing_object_id = "test-client-id"
    link.elicensing_object_kind = ELicensingLink.ObjectKind.CLIENT
    link.sync_status = "SUCCESS"
    link.last_sync_at = timezone.now()
    return link


@pytest.fixture
def mock_pending_elicensing_link():
    """Mock a pending ELicensingLink object with no elicensing_object_id"""
    link = MagicMock(spec=ELicensingLink)
    link.id = 2
    link.elicensing_guid = uuid.uuid4()
    link.elicensing_object_id = None
    link.elicensing_object_kind = ELicensingLink.ObjectKind.CLIENT
    link.sync_status = "PENDING"
    link.last_sync_at = timezone.now()
    return link


class TestOperatorELicensingService:
    """Tests for the OperatorELicensingService class"""

    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLink')
    def test_map_operator_to_client_data_with_link(
        self, mock_elicensing_link_model, mock_operator, mock_elicensing_link
    ):
        """Test mapping operator data to client data with existing link"""
        result = OperatorELicensingService._map_operator_to_client_data(mock_operator, mock_elicensing_link)

        # Verify the mapping is correct
        assert result["clientGUID"] == str(mock_elicensing_link.elicensing_guid)
        assert result["companyName"] == mock_operator.legal_name
        assert result["doingBusinessAs"] == mock_operator.trade_name
        assert result["bcCompanyRegistrationNumber"] == mock_operator.bc_corporate_registry_number
        assert result["dateOfBirth"] == "1970-01-01"

        # Check address mapping
        assert result["addressLine1"] == mock_operator.physical_address.street_address
        assert result["city"] == mock_operator.physical_address.municipality
        assert result["stateProvince"] == mock_operator.physical_address.province
        assert result["postalCode"] == mock_operator.physical_address.postal_code
        assert result["country"] == "Canada"

        # Check required phone field
        assert "businessPhone" in result

    def test_map_operator_to_client_data_without_link(self, mock_operator):
        """Test mapping operator data to client data without existing link raises error"""
        with pytest.raises(ValueError, match="Cannot map operator to client data without an existing link"):
            OperatorELicensingService._map_operator_to_client_data(mock_operator, None)

    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLink')
    def test_map_operator_to_client_data_with_mailing_address(
        self, mock_elicensing_link_model, mock_operator_mailing_only, mock_elicensing_link
    ):
        """Test mapping operator with only mailing address"""
        result = OperatorELicensingService._map_operator_to_client_data(
            mock_operator_mailing_only, mock_elicensing_link
        )

        # Check mailing address is used
        assert result["addressLine1"] == mock_operator_mailing_only.mailing_address.street_address
        assert result["city"] == mock_operator_mailing_only.mailing_address.municipality
        assert result["stateProvince"] == mock_operator_mailing_only.mailing_address.province
        assert result["postalCode"] == mock_operator_mailing_only.mailing_address.postal_code

    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLink')
    def test_map_operator_to_client_data_no_addresses(
        self, mock_elicensing_link_model, mock_operator_no_addresses, mock_elicensing_link
    ):
        """Test mapping operator with no addresses uses placeholder values"""
        result = OperatorELicensingService._map_operator_to_client_data(
            mock_operator_no_addresses, mock_elicensing_link
        )

        # Check placeholder values are used
        assert result["addressLine1"] == "Unknown"
        assert result["city"] == "Unknown"
        assert result["stateProvince"] == "BC"
        assert result["postalCode"] == "V0V0V0"
        assert result["country"] == "Canada"

    @pytest.mark.django_db
    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLink')
    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLinkService')
    def test_ensure_client_exists_existing_client(
        self, mock_link_service, mock_elicensing_link_class, mock_operator, mock_elicensing_link
    ):
        """Test sync_client_with_elicensing when client already exists"""
        # Setup mock operator
        mock_operator.id = uuid.uuid4()

        # Setup mock for existing link
        mock_link_service.get_link_for_model.return_value = mock_elicensing_link
        mock_elicensing_link.elicensing_object_id = "12345"

        # Call the method
        result = OperatorELicensingService.sync_client_with_elicensing(mock_operator.id)

        # Assert that the existing link was returned
        assert result == mock_elicensing_link
        mock_link_service.get_link_for_model.assert_called_once_with(
            Operator, mock_operator.id, elicensing_object_kind=ELicensingLink.ObjectKind.CLIENT
        )

    @pytest.mark.django_db
    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLink')
    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLinkService')
    @patch('service.compliance.elicensing.operator_elicensing_service.Operator.objects.get')
    def test_ensure_client_exists_operator_not_found(
        self, mock_get, mock_link_service, mock_elicensing_link_class, mock_operator
    ):
        """Test sync_client_with_elicensing when operator does not exist"""
        # Setup mock operator and mock it not being found
        mock_operator.id = uuid.uuid4()
        mock_operator.objects.get.side_effect = Operator.DoesNotExist

        # Call the method
        result = OperatorELicensingService.sync_client_with_elicensing(mock_operator.id)

        # Assert result is None
        assert result is None

    @pytest.mark.django_db
    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLink')
    @patch('service.compliance.elicensing.operator_elicensing_service.ContentType')
    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLinkService')
    @patch('service.compliance.elicensing.operator_elicensing_service.Operator.objects.get')
    @patch('service.compliance.elicensing.operator_elicensing_service.elicensing_api_client')
    @patch(
        'service.compliance.elicensing.operator_elicensing_service.OperatorELicensingService._map_operator_to_client_data'
    )
    def test_ensure_client_exists_create_client_success(
        self,
        mock_map_data,
        mock_api_client,
        mock_get,
        mock_link_service,
        mock_content_type,
        mock_operator,
        mock_client_link,
    ):
        """Test sync_client_with_elicensing successfully creates a new client"""
        # Setup mock operator
        mock_operator.id = uuid.uuid4()

        # No existing link
        mock_link_service.get_link_for_model.return_value = None

        # Setup successful API call
        mock_api_client.create_client.return_value = {"clientObjectId": "54321", "clientGUID": str(uuid.uuid4())}

        # Call the method
        result = OperatorELicensingService.sync_client_with_elicensing(mock_operator.id)

        # Assert result is the new link
        assert result == mock_client_link
        assert mock_client_link.elicensing_object_id == "54321"
        assert mock_client_link.sync_status == "SUCCESS"

        # Assert save was called
        assert mock_client_link.save.called

    @pytest.mark.django_db
    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLink')
    @patch('service.compliance.elicensing.operator_elicensing_service.ContentType')
    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLinkService')
    @patch('service.compliance.elicensing.operator_elicensing_service.Operator.objects.get')
    @patch('service.compliance.elicensing.operator_elicensing_service.elicensing_api_client')
    @patch(
        'service.compliance.elicensing.operator_elicensing_service.OperatorELicensingService._map_operator_to_client_data'
    )
    def test_ensure_client_exists_create_client_invalid_response(
        self,
        mock_map_data,
        mock_api_client,
        mock_get,
        mock_link_service,
        mock_content_type,
        mock_operator,
        mock_client_link,
    ):
        """Test sync_client_with_elicensing handles invalid API responses by returning None"""
        # Setup mock operator
        mock_operator.id = uuid.uuid4()

        # No existing link
        mock_link_service.get_link_for_model.return_value = None

        # Setup invalid API response
        mock_api_client.create_client.side_effect = ValueError("Invalid response from API")

        # Call the method
        result = OperatorELicensingService.sync_client_with_elicensing(mock_operator.id)

        # Assert result is None
        assert result is None
        assert mock_client_link.sync_status == "FAILED"

    @pytest.mark.django_db
    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLink')
    @patch('service.compliance.elicensing.operator_elicensing_service.ContentType')
    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLinkService')
    @patch('service.compliance.elicensing.operator_elicensing_service.Operator.objects.get')
    @patch('service.compliance.elicensing.operator_elicensing_service.elicensing_api_client')
    @patch(
        'service.compliance.elicensing.operator_elicensing_service.OperatorELicensingService._map_operator_to_client_data'
    )
    def test_ensure_client_exists_request_exception(
        self,
        mock_map_data,
        mock_api_client,
        mock_get,
        mock_link_service,
        mock_content_type,
        mock_operator,
        mock_client_link,
    ):
        """Test sync_client_with_elicensing handles RequestException properly"""
        # Setup mock operator
        mock_operator.id = uuid.uuid4()

        # No existing link
        mock_link_service.get_link_for_model.return_value = None

        # Setup API raising RequestException
        mock_api_client.create_client.side_effect = requests.RequestException("Connection failed")

        # Call the method
        result = OperatorELicensingService.sync_client_with_elicensing(mock_operator.id)

        # Assert result is None
        assert result is None
        assert mock_client_link.sync_status == "FAILED"

    @pytest.mark.django_db
    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLink')
    @patch('service.compliance.elicensing.operator_elicensing_service.ContentType')
    @patch('service.compliance.elicensing.operator_elicensing_service.ELicensingLinkService')
    @patch('service.compliance.elicensing.operator_elicensing_service.Operator.objects.get')
    @patch('service.compliance.elicensing.operator_elicensing_service.elicensing_api_client')
    @patch(
        'service.compliance.elicensing.operator_elicensing_service.OperatorELicensingService._map_operator_to_client_data'
    )
    def test_ensure_client_exists_http_error(
        self,
        mock_map_data,
        mock_api_client,
        mock_get,
        mock_link_service,
        mock_content_type,
        mock_operator,
        mock_client_link,
    ):
        """Test sync_client_with_elicensing handles HTTPError properly"""
        # Setup mock operator
        mock_operator.id = uuid.uuid4()

        # No existing link
        mock_link_service.get_link_for_model.return_value = None

        # Setup API raising HTTPError
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = requests.HTTPError("404 Not Found")
        mock_api_client.create_client.side_effect = requests.HTTPError("404 Not Found", response=mock_response)

        # Call the method
        result = OperatorELicensingService.sync_client_with_elicensing(mock_operator.id)

        # Assert result is None
        assert result is None
        assert mock_client_link.sync_status == "FAILED"
