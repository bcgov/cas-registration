from unittest.mock import patch, MagicMock
from service.elicensing_service import ELicensingService
import pytest


class TestELicensingService:
    """Tests for the ELicensingService class"""

    @patch('service.elicensing_service.settings')
    def setup_method(self, method, mock_settings):
        """Set up the test environment before each test"""
        # Mock settings
        mock_settings.ELICENSING_API_URL = 'https://test-api.example.com'
        mock_settings.ELICENSING_AUTH_TOKEN = 'test-token'

        # Reset the singleton instance to pick up the mocked settings
        ELicensingService._instance = None

        # Create a new instance with the mocked settings
        self.service = ELicensingService()

    def test_singleton_pattern(self):
        """Test that the ELicensingService follows the singleton pattern"""
        service1 = ELicensingService()
        service2 = ELicensingService()
        assert service1 is service2
        # We can't test against the global elicensing_service because it's created before our tests run

    @patch('service.elicensing_service.requests.request')
    def test_test_connection_success(self, mock_request):
        """Test the test_connection method when the connection is successful"""
        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'clientObjectId': '174044621',
            'businessAreaCode': 'CG',
            'companyName': 'Test Company',
        }
        mock_request.return_value = mock_response

        # Call the method
        result = self.service.test_connection()

        # Check the result
        assert result['status'] == 'connected'
        assert 'Successfully connected' in result['message']
        assert result['api_response'] == 200
        assert 'client_data' in result
        assert result['client_data']['clientObjectId'] == '174044621'

    @patch('service.elicensing_service.requests.request')
    def test_test_connection_error(self, mock_request):
        """Test the test_connection method when there's an error"""
        # Mock the response to raise an exception
        mock_request.side_effect = Exception('Connection error')

        # Call the method
        result = self.service.test_connection()

        # Check the result
        assert result['status'] == 'error'
        assert 'Failed to connect' in result['message']
        assert 'Connection error' in result['error']

    @patch('service.elicensing_service.requests.post')
    def test_create_client(self, mock_post):
        """Test the create_client method"""
        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'clientObjectId': '12345',
            'businessAreaCode': 'CG',
            'clientGUID': 'test-guid',
        }
        mock_post.return_value = mock_response

        # Call the method
        client_data = {
            'clientGUID': 'test-guid',
            'companyName': 'Test Company',
            'addressLine1': '123 Test St',
            'city': 'Test City',
            'stateProvince': 'BC',
            'postalCode': 'V1V 1V1',
        }
        result = self.service.create_client(client_data)

        # Check the result
        assert result['clientObjectId'] == '12345'
        assert result['businessAreaCode'] == 'CG'
        assert result['clientGUID'] == 'test-guid'

        # Check that businessAreaCode was set to "CG"
        mock_post.assert_called_once()
        called_data = mock_post.call_args[1]['json']
        assert called_data['businessAreaCode'] == 'CG'

    @patch('service.elicensing_service.requests.get')
    def test_query_balance(self, mock_get):
        """Test the query_balance method"""
        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'clientObjectId': '12345', 'balance': 100.00}
        mock_get.return_value = mock_response

        # Call the method
        result = self.service.query_balance('12345')

        # Check the result
        assert result['clientObjectId'] == '12345'
        assert result['balance'] == pytest.approx(100.00)

        # Check that the correct parameters were passed
        mock_get.assert_called_once()
        called_params = mock_get.call_args[1]['params']
        assert called_params['clientObjectId'] == '12345'

    @patch('service.elicensing_service.requests.get')
    def test_query_client(self, mock_get):
        """Test the query_client method"""
        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'clientObjectId': '174044621',
            'businessAreaCode': 'CG',
            'companyName': 'Test Company',
        }
        mock_get.return_value = mock_response

        # Call the method
        result = self.service.query_client('174044621')

        # Check the result
        assert result['clientObjectId'] == '174044621'
        assert result['businessAreaCode'] == 'CG'
        assert result['companyName'] == 'Test Company'

        # Check that the correct parameters were passed
        mock_get.assert_called_once()
        called_params = mock_get.call_args[1]['params']
        assert called_params['clientObjectId'] == '174044621'
