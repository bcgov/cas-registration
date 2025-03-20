from unittest.mock import patch, MagicMock
import uuid
import requests

import pytest
from django.utils import timezone

from service.operator_elicensing_service import OperatorELicensingService
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

    @patch('service.operator_elicensing_service.ELicensingLink')
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

    @patch('service.operator_elicensing_service.ELicensingLink')
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

    @patch('service.operator_elicensing_service.ELicensingLink')
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
    @patch('service.operator_elicensing_service.ELicensingLink')
    @patch('service.operator_elicensing_service.ELicensingLinkService')
    def test_ensure_client_exists_existing_client(
        self, mock_link_service, mock_elicensing_link_class, mock_operator, mock_elicensing_link
    ):
        """Test ensure_client_exists when client already exists"""
        # Set up mock to return an existing link
        mock_link_service.get_link_for_model.return_value = mock_elicensing_link

        # Make sure the link has an object ID (meaning it's already created in eLicensing)
        mock_elicensing_link.elicensing_object_id = "existing-client-id"

        # Call the method
        result = OperatorELicensingService.ensure_client_exists(mock_operator.id)

        # Verify results
        assert result == mock_elicensing_link
        mock_link_service.get_link_for_model.assert_called_once_with(
            Operator, mock_operator.id, elicensing_object_kind=mock_elicensing_link_class.ObjectKind.CLIENT
        )

    @pytest.mark.django_db
    @patch('service.operator_elicensing_service.ELicensingLink')
    @patch('service.operator_elicensing_service.ELicensingLinkService')
    @patch('service.operator_elicensing_service.Operator.objects.get')
    def test_ensure_client_exists_operator_not_found(
        self, mock_get, mock_link_service, mock_elicensing_link_class, mock_operator
    ):
        """Test ensure_client_exists when operator does not exist"""
        # Set up mocks
        mock_link_service.get_link_for_model.return_value = None
        mock_get.side_effect = Operator.DoesNotExist()

        # Call the method
        result = OperatorELicensingService.ensure_client_exists(mock_operator.id)

        # Verify results
        assert result is None
        mock_link_service.get_link_for_model.assert_called_once_with(
            Operator, mock_operator.id, elicensing_object_kind=mock_elicensing_link_class.ObjectKind.CLIENT
        )
        mock_get.assert_called_once_with(id=mock_operator.id)

    @pytest.mark.django_db
    @patch('service.operator_elicensing_service.ELicensingLink')
    @patch('service.operator_elicensing_service.ContentType')
    @patch('service.operator_elicensing_service.ELicensingLinkService')
    @patch('service.operator_elicensing_service.Operator.objects.get')
    @patch('service.operator_elicensing_service.elicensing_api_client')
    @patch('service.operator_elicensing_service.OperatorELicensingService._map_operator_to_client_data')
    def test_ensure_client_exists_create_client_success(
        self,
        mock_map_data,
        mock_api_client,
        mock_get,
        mock_link_service,
        mock_content_type,
        mock_elicensing_link_class,
        mock_operator,
    ):
        """Test ensure_client_exists successfully creates a new client"""
        # Set up mocks
        mock_link_service.get_link_for_model.return_value = None
        mock_get.return_value = mock_operator
        mock_content_type.objects.get_for_model.return_value = MagicMock()

        # Mock the ELicensingLink class and instance
        mock_link = MagicMock()
        mock_elicensing_link_class.return_value = mock_link
        mock_link.id = uuid.uuid4()
        mock_link.elicensing_guid = uuid.uuid4()

        client_data = {"clientGUID": str(mock_link.elicensing_guid), "companyName": mock_operator.legal_name}
        mock_map_data.return_value = client_data

        # API client now returns pre-validated response
        api_response = {"clientObjectId": "new-client-id", "clientGUID": str(mock_link.elicensing_guid)}
        mock_api_client.create_client.return_value = api_response

        # Call the method
        result = OperatorELicensingService.ensure_client_exists(mock_operator.id)

        # Verify results
        assert result == mock_link
        mock_link_service.get_link_for_model.assert_called_once_with(
            Operator, mock_operator.id, elicensing_object_kind=mock_elicensing_link_class.ObjectKind.CLIENT
        )
        mock_get.assert_called_once_with(id=mock_operator.id)
        mock_content_type.objects.get_for_model.assert_called_once_with(Operator)
        mock_elicensing_link_class.assert_called_once()
        mock_map_data.assert_called_once_with(mock_operator, mock_link)
        mock_api_client.create_client.assert_called_once_with(client_data)

        # Check that link was updated with correct values
        assert mock_link.elicensing_object_id == "new-client-id"
        assert mock_link.sync_status == "SUCCESS"
        mock_link.save.assert_called_once()

    @pytest.mark.django_db
    @patch('service.operator_elicensing_service.ELicensingLink')
    @patch('service.operator_elicensing_service.ContentType')
    @patch('service.operator_elicensing_service.ELicensingLinkService')
    @patch('service.operator_elicensing_service.Operator.objects.get')
    @patch('service.operator_elicensing_service.elicensing_api_client')
    @patch('service.operator_elicensing_service.OperatorELicensingService._map_operator_to_client_data')
    def test_ensure_client_exists_create_client_invalid_response(
        self,
        mock_map_data,
        mock_api_client,
        mock_get,
        mock_link_service,
        mock_content_type,
        mock_elicensing_link_class,
        mock_operator,
    ):
        """Test ensure_client_exists handles invalid API responses by returning None"""
        # Set up mocks
        mock_link_service.get_link_for_model.return_value = None
        mock_get.return_value = mock_operator
        mock_content_type.objects.get_for_model.return_value = MagicMock()

        # Mock the ELicensingLink class and instance
        mock_link = MagicMock()
        mock_elicensing_link_class.return_value = mock_link
        mock_link.id = uuid.uuid4()
        mock_link.elicensing_guid = uuid.uuid4()

        client_data = {"clientGUID": str(mock_link.elicensing_guid), "companyName": mock_operator.legal_name}
        mock_map_data.return_value = client_data

        # Mock API raising ValueError for missing clientObjectId
        mock_api_client.create_client.side_effect = ValueError("Missing or empty clientObjectId in response")

        # Call the method
        result = OperatorELicensingService.ensure_client_exists(mock_operator.id)

        # Verify results
        assert result is None
        mock_link_service.get_link_for_model.assert_called_once_with(
            Operator, mock_operator.id, elicensing_object_kind=mock_elicensing_link_class.ObjectKind.CLIENT
        )
        mock_get.assert_called_once_with(id=mock_operator.id)
        mock_content_type.objects.get_for_model.assert_called_once_with(Operator)
        mock_elicensing_link_class.assert_called_once()
        mock_map_data.assert_called_once_with(mock_operator, mock_link)
        mock_api_client.create_client.assert_called_once_with(client_data)
        assert not mock_link.save.called  # Ensure the link wasn't saved

    @pytest.mark.django_db
    @patch('service.operator_elicensing_service.ELicensingLink')
    @patch('service.operator_elicensing_service.ContentType')
    @patch('service.operator_elicensing_service.ELicensingLinkService')
    @patch('service.operator_elicensing_service.Operator.objects.get')
    @patch('service.operator_elicensing_service.elicensing_api_client')
    @patch('service.operator_elicensing_service.OperatorELicensingService._map_operator_to_client_data')
    def test_ensure_client_exists_request_exception(
        self,
        mock_map_data,
        mock_api_client,
        mock_get,
        mock_link_service,
        mock_content_type,
        mock_elicensing_link_class,
        mock_operator,
    ):
        """Test ensure_client_exists handles RequestException properly"""
        # Set up mocks
        mock_link_service.get_link_for_model.return_value = None
        mock_get.return_value = mock_operator
        mock_content_type.objects.get_for_model.return_value = MagicMock()

        # Mock the ELicensingLink class and instance
        mock_link = MagicMock()
        mock_elicensing_link_class.return_value = mock_link
        mock_link.id = uuid.uuid4()
        mock_link.elicensing_guid = uuid.uuid4()

        client_data = {"clientGUID": str(mock_link.elicensing_guid), "companyName": mock_operator.legal_name}
        mock_map_data.return_value = client_data

        # Raise RequestException
        mock_api_client.create_client.side_effect = requests.RequestException("API request failed")

        # Call the method
        result = OperatorELicensingService.ensure_client_exists(mock_operator.id)

        # Verify results
        assert result is None
        mock_api_client.create_client.assert_called_once_with(client_data)
        assert not mock_link.save.called  # Ensure the link wasn't saved

    @pytest.mark.django_db
    @patch('service.operator_elicensing_service.ELicensingLink')
    @patch('service.operator_elicensing_service.ContentType')
    @patch('service.operator_elicensing_service.ELicensingLinkService')
    @patch('service.operator_elicensing_service.Operator.objects.get')
    @patch('service.operator_elicensing_service.elicensing_api_client')
    @patch('service.operator_elicensing_service.OperatorELicensingService._map_operator_to_client_data')
    def test_ensure_client_exists_http_error(
        self,
        mock_map_data,
        mock_api_client,
        mock_get,
        mock_link_service,
        mock_content_type,
        mock_elicensing_link_class,
        mock_operator,
    ):
        """Test ensure_client_exists handles HTTPError properly"""
        # Set up mocks
        mock_link_service.get_link_for_model.return_value = None
        mock_get.return_value = mock_operator
        mock_content_type.objects.get_for_model.return_value = MagicMock()

        # Mock the ELicensingLink class and instance
        mock_link = MagicMock()
        mock_elicensing_link_class.return_value = mock_link
        mock_link.id = uuid.uuid4()
        mock_link.elicensing_guid = uuid.uuid4()

        client_data = {"clientGUID": str(mock_link.elicensing_guid), "companyName": mock_operator.legal_name}
        mock_map_data.return_value = client_data

        # Raise HTTPError (which would occur when API returns an error status code)
        mock_api_client.create_client.side_effect = requests.HTTPError("400 Client Error")

        # Call the method
        result = OperatorELicensingService.ensure_client_exists(mock_operator.id)

        # Verify results
        assert result is None
        mock_api_client.create_client.assert_called_once_with(client_data)
        assert not mock_link.save.called  # Ensure the link wasn't saved
