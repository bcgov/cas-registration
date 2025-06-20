from unittest.mock import patch, MagicMock
import uuid
from compliance.models.elicensing_client_operator import ElicensingClientOperator
from compliance.service.elicensing.elicensing_operator_service import ElicensingOperatorService
import requests

import pytest

from registration.models.operator import Operator
from model_bakery.baker import make_recipe
from django.core.exceptions import MultipleObjectsReturned


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
def mock_operator_get():
    """Mock Operator.objects.get"""
    with patch('compliance.service.elicensing.elicensing_operator_service.Operator.objects.get') as mock:
        yield mock


@pytest.fixture
def mock_api_client():
    """Mock elicensing_api_client"""
    with patch('compliance.service.elicensing.elicensing_operator_service.elicensing_api_client') as mock:
        yield mock


class TestElicensingOperatorService:
    """Tests for the ElicensingOperatorService class"""

    def test_map_operator_to_client_data_with_physical_address(self, mock_operator):
        """Test mapping operator data to client data with physical address"""
        result = ElicensingOperatorService._map_operator_to_client_data(mock_operator)

        # Verify the mapping is correct
        assert result.clientGUID is not None
        assert result.companyName == mock_operator.legal_name
        assert result.doingBusinessAs == mock_operator.trade_name
        assert result.bcCompanyRegistrationNumber == mock_operator.bc_corporate_registry_number

        # Check address mapping
        assert result.addressLine1 == mock_operator.physical_address.street_address
        assert result.city == mock_operator.physical_address.municipality
        assert result.stateProvince == mock_operator.physical_address.province
        assert result.postalCode == mock_operator.physical_address.postal_code
        assert result.country == "Canada"

    def test_map_operator_to_client_data_with_mailing_address(self, mock_operator_mailing_only):
        """Test mapping operator with only mailing address"""
        result = ElicensingOperatorService._map_operator_to_client_data(mock_operator_mailing_only)

        # Check mailing address is used
        assert result.addressLine1 == mock_operator_mailing_only.mailing_address.street_address
        assert result.city == mock_operator_mailing_only.mailing_address.municipality
        assert result.stateProvince == mock_operator_mailing_only.mailing_address.province
        assert result.postalCode == mock_operator_mailing_only.mailing_address.postal_code

    def test_map_operator_to_client_data_no_addresses(self, mock_operator_no_addresses):
        """Test mapping operator with no addresses uses placeholder values"""
        result = ElicensingOperatorService._map_operator_to_client_data(mock_operator_no_addresses)

        # Check placeholder values are used
        assert result.addressLine1 == "Unknown"
        assert result.city == "Unknown"
        assert result.stateProvince == "BC"
        assert result.postalCode == "V0V0V0"
        assert result.country == "Canada"

    @pytest.mark.django_db
    def test_sync_client_with_elicensing_existing_client(self):
        """Test sync_client_with_elicensing when client already exists"""
        # Setup mocks
        client_operator = make_recipe('compliance.tests.utils.elicensing_client_operator')

        # Call the method
        result = ElicensingOperatorService.sync_client_with_elicensing(client_operator.operator_id)

        # Assert that the existing link was returned
        assert result == client_operator

    @pytest.mark.django_db
    def test_sync_client_with_elicensing_operator_not_found(self, mock_operator):
        """Test sync_client_with_elicensing when operator does not exist"""

        operator = mock_operator

        # Call the method and expect exception
        with pytest.raises(Operator.DoesNotExist):
            ElicensingOperatorService.sync_client_with_elicensing(operator.id)

    @pytest.mark.django_db
    def test_sync_client_with_elicensing_create_client_success(self, mock_api_client):
        """Test sync_client_with_elicensing successfully creates a new client"""
        # Setup mocks
        operator = make_recipe('registration.tests.utils.operator')

        # Setup successful API call
        mock_response = MagicMock()
        mock_response.clientObjectId = "54321"
        mock_api_client.create_client.return_value = mock_response

        # Call the method
        result = ElicensingOperatorService.sync_client_with_elicensing(operator.id)

        # Assert result is the new link
        assert result == ElicensingClientOperator.objects.get(operator_id=operator.id)

    @pytest.mark.django_db
    def test_sync_client_with_elicensing_api_error(self, mock_api_client):
        """Test sync_client_with_elicensing handles API errors"""

        operator = make_recipe('registration.tests.utils.operator')

        # Setup API error
        mock_api_client.create_client.side_effect = requests.RequestException("API Error")

        # Call the method and expect exception
        with pytest.raises(requests.RequestException):
            ElicensingOperatorService.sync_client_with_elicensing(operator.id)

    @pytest.mark.django_db
    def test_sync_client_with_elicensing_multiple_records_error(self):
        """Test sync_client_with_elicensing handles multiple record errors"""

        client_operator = make_recipe('compliance.tests.utils.elicensing_client_operator')
        make_recipe('compliance.tests.utils.elicensing_client_operator', operator_id=client_operator.operator_id)

        # Call the method and expect exception
        with pytest.raises(MultipleObjectsReturned):
            ElicensingOperatorService.sync_client_with_elicensing(client_operator.operator_id)
