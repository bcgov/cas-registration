import pytest
from unittest.mock import Mock
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import requests
from service.compliance.bc_carbon_registry.bc_carbon_registry_api_client import BCCarbonRegistryAPIClient
from service.compliance.bc_carbon_registry.exceptions import BCCarbonRegistryError
from service.compliance.bc_carbon_registry.schema import SearchFilter, Pagination, FilterModel, GenericResponse


@pytest.fixture(autouse=True)
def setup(monkeypatch):
    # Set environment variables using monkeypatch
    monkeypatch.setenv('BCCR_API_URL', 'https://api.example.com')
    monkeypatch.setenv('BCCR_CLIENT_ID', 'test_client_id')
    monkeypatch.setenv('BCCR_CLIENT_SECRET', 'test_client_secret')

    # Reset singleton instance for each test to avoid state leakage
    BCCarbonRegistryAPIClient._instance = None
    client = BCCarbonRegistryAPIClient()

    # Yield the client for tests to use
    yield client

    # Cleanup after each test
    BCCarbonRegistryAPIClient._instance = None


class TestBCCarbonRegistryAPIClient:
    def test_singleton_pattern(self, setup):
        client1 = BCCarbonRegistryAPIClient()
        client2 = BCCarbonRegistryAPIClient()
        assert client1 is client2

    def test_initialization(self, setup):
        """Test client initialization with environment variables."""
        client = setup
        assert client.api_url == 'https://api.example.com'
        assert client.client_id == 'test_client_id'
        assert client.client_secret == 'test_client_secret'
        assert client.token is None
        assert client.token_expiry is None

    def test_authenticate_success(self, setup, mocker):
        """Test successful authentication."""
        client = setup
        mock_post = mocker.patch('requests.post')
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'access_token': 'test_token', 'expires_in': 3600, 'token_type': 'Bearer'}
        mock_post.return_value = mock_response

        client._authenticate()

        assert client.token == 'test_token'
        assert isinstance(client.token_expiry, datetime)
        mock_post.assert_called_with(
            'https://api.example.com/user-api/okta/token',
            json={'clientId': 'test_client_id', 'clientSecret': 'test_client_secret'},
        )

    def test_authenticate_failure(self, setup, mocker):
        """Test authentication failure handling."""
        client = setup
        mock_post = mocker.patch('requests.post')
        mock_response = Mock()
        mock_response.status_code = 401
        mock_response.raise_for_status.side_effect = requests.HTTPError('Unauthorized')
        mock_post.return_value = mock_response

        with pytest.raises(BCCarbonRegistryError, match='Invalid token response'):
            client._authenticate()

    def test_ensure_authenticated_token_expired(self, setup, mocker):
        """Test re-authentication when token is expired."""
        client = setup
        client.token = 'old_token'
        client.token_expiry = datetime.now(ZoneInfo("UTC")) - timedelta(seconds=3600)

        mock_post = mocker.patch('requests.post')
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'access_token': 'new_token', 'expires_in': 3600, 'token_type': 'Bearer'}
        mock_post.return_value = mock_response

        client._ensure_authenticated()
        assert client.token == 'new_token'

    def test_make_request_success(self, setup, mocker):
        """Test successful API request."""
        client = setup
        client.token = 'test_token'
        client.token_expiry = datetime.now(ZoneInfo("UTC")) + timedelta(seconds=3600)

        mock_request = mocker.patch('requests.request')
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'success': True, 'result': {}}
        mock_request.return_value = mock_response

        payload = SearchFilter(pagination=Pagination(), filterModel=FilterModel())

        result = client._make_request(method='POST', endpoint='/test', data=payload, response_model=GenericResponse)

        assert result == {'success': True, 'result': {}}
        mock_request.assert_called_with(
            method='POST',
            url='https://api.example.com/test',
            headers={'Authorization': 'Bearer test_token', 'Content-Type': 'application/json'},
            json=payload.model_dump_json(),
            params=None,
        )

    def test_make_request_validation_error(self, setup, mocker):
        """Test handling of invalid response format."""
        client = setup
        client.token = 'test_token'
        client.token_expiry = datetime.now(ZoneInfo("UTC")) + timedelta(seconds=3600)

        mock_request = mocker.patch('requests.request')
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'invalid_field': 'value'}
        mock_request.return_value = mock_response

        with pytest.raises(BCCarbonRegistryError, match='Invalid response format'):
            client._make_request(method='GET', endpoint='/test', response_model=GenericResponse)

    def test_get_account_details(self, setup, mocker):
        """Test retrieving account details."""
        client = setup
        client.token = 'test_token'
        client.token_expiry = datetime.now(ZoneInfo("UTC")) + timedelta(seconds=3600)

        mock_request = mocker.patch('requests.request')
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'totalEntities': 1,
            'totalPages': 1,
            'numberOfElements': 1,
            'first': True,
            'last': True,
            'entities': [{'entityId': 123, 'accountName': 'Test Account'}],
        }
        mock_request.return_value = mock_response

        result = client.get_account_details('123')

        assert result['totalEntities'] == 1
        assert len(result['entities']) == 1
        assert result['entities'][0]['entityId'] == 123

    def test_get_account_details_invalid_id(self, setup):
        """Test handling of invalid account ID."""
        client = setup
        with pytest.raises(ValueError, match='account_id must be a numeric string'):
            client.get_account_details('invalid')

    def test_list_all_accounts(self, setup, mocker):
        """Test listing all accounts."""
        client = setup
        client.token = 'test_token'
        client.token_expiry = datetime.now(ZoneInfo("UTC")) + timedelta(seconds=3600)

        mock_request = mocker.patch('requests.request')
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'totalEntities': 2,
            'totalPages': 1,
            'numberOfElements': 2,
            'first': True,
            'last': True,
            'entities': [
                {'entityId': 123, 'accountName': 'Test Account 1'},
                {'entityId': 124, 'accountName': 'Test Account 2'},
            ],
        }
        mock_request.return_value = mock_response

        result = client.list_all_accounts(limit=10, start=0)

        assert result['totalEntities'] == 2
        assert len(result['entities']) == 2

    def test_list_all_accounts_invalid_params(self, setup):
        """Test handling of invalid pagination parameters."""
        client = setup
        with pytest.raises(ValueError, match='limit must be positive'):
            client.list_all_accounts(limit=0)

        with pytest.raises(ValueError, match='start non-negative'):
            client.list_all_accounts(start=-1)

    def test_create_project(self, setup, mocker):
        """Test creating a new project."""
        client = setup
        client.token = 'test_token'
        client.token_expiry = datetime.now(ZoneInfo("UTC")) + timedelta(seconds=3600)

        mock_request = mocker.patch('requests.request')
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'success': True, 'result': {'id': '123'}}
        mock_request.return_value = mock_response

        project_data = {
            'account_id': '103100000028575',
            'project_name': 'Test Project',
            'project_description': 'Test Description',
            'mixedUnitList': [
                {
                    'city': 'City',
                    'address_line_1': 'Line 1',
                    'zipcode': 'H0H0H0',
                    'province': 'BC',
                    'period_start_date': '2025-01-01',
                    'period_end_date': '2025-01-31',
                }
            ],
        }

        result = client.create_project(project_data)

        assert result['success'] is True
        assert result['result']['id'] == '123'

    def test_create_project_invalid_payload(self, setup):
        """Test handling of invalid project payload."""
        client = setup
        invalid_data = {
            'account_id': 'invalid',
            'project_name': 'Test Project',
            'project_description': 'Test Description',
            'mixedUnitList': [],
        }

        with pytest.raises(BCCarbonRegistryError, match='Invalid project payload'):
            client.create_project(invalid_data)

    def test_transfer_compliance_units(self, setup, mocker):
        """Test transferring compliance units."""
        client = setup
        client.token = 'test_token'
        client.token_expiry = datetime.now(ZoneInfo("UTC")) + timedelta(seconds=3600)

        mock_request = mocker.patch('requests.request')
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'success': True, 'result': {'transfer_id': '456'}}
        mock_request.return_value = mock_response

        transfer_data = {
            'destination_account_id': '103000000036531',
            'mixedUnitList': [
                {
                    'account_id': 202,
                    'serial_no': 'BC-BCE-IN-104000000037027-01032025-30032025-16414-16752-SPG',
                    'new_quantity': 1,
                    'id': '103200000396923',
                    'do_action': True,
                }
            ],
        }

        result = client.transfer_compliance_units(transfer_data)

        assert result['success'] is True
        assert result['result']['transfer_id'] == '456'

    def test_create_sub_account(self, setup, mocker):
        """Test creating a sub-account."""
        client = setup
        client.token = 'test_token'
        client.token_expiry = datetime.now(ZoneInfo("UTC")) + timedelta(seconds=3600)

        mock_request = mocker.patch('requests.request')
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'success': True, 'result': {'account_id': '789'}}
        mock_request.return_value = mock_response

        sub_account_data = {
            'organization_classification_id': 100000000000097,
            'compliance_year': 2025,
            'registered_name': 'Test BC Subaccount',
            'master_account_id': 103000000037199,
            'type_of_organization': '140000000000001',
            'trading_name': 'Test BC Subaccount Trading',
            'registration_number_assigned_by_registrar': 'dwd',
            'boro_id': '12-3456',
        }

        result = client.create_sub_account(sub_account_data)

        assert result['success'] is True
        assert result['result']['account_id'] == '789'

    def test_create_issuance(self, setup, mocker):
        """Test creating an issuance."""
        client = setup
        client.token = 'test_token'
        client.token_expiry = datetime.now(ZoneInfo("UTC")) + timedelta(seconds=3600)

        mock_request = mocker.patch('requests.request')
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'success': True, 'result': {'issuance_id': '101'}}
        mock_request.return_value = mock_response

        issuance_data = {
            'account_id': '103100000028575',
            'issuance_requested_date': '2025-01-24T13:13:28.547Z',
            'project_id': 104000000036500,
            'unit_type_id': 140000000000001,
            'verifications': [
                {
                    'verificationStartDate': '2025-01-01',
                    'verificationEndDate': '2025-01-31',
                    'monitoringPeriod': '01/01/2025 - 31/01/2025',
                    'verifierId': 204,
                    'mixedUnits': [
                        {
                            'holding_quantity': 100,
                            'state_name': 'NEW',
                            'vintage_start': '2025-01-01T00:00:00Z',
                            'vintage_end': '2025-01-31T00:00:00Z',
                            'city': 'City',
                            'address_line_1': 'Line 1',
                            'zipcode': 'H0H0H0',
                            'province': 'BC',
                            'defined_unit_id': 103000000392535,
                        }
                    ],
                }
            ],
        }

        result = client.create_issuance(issuance_data)

        assert result['success'] is True
        assert result['result']['issuance_id'] == '101'
