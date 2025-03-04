import pytest
from unittest.mock import patch, MagicMock
from compliance.service.elicensing_service import ELicensingService, elicensing_service


class TestELicensingService:
    """Tests for the ELicensingService class"""

    def test_singleton_pattern(self):
        """Test that the ELicensingService follows the singleton pattern"""
        service1 = ELicensingService()
        service2 = ELicensingService()
        assert service1 is service2
        assert service1 is elicensing_service

    @patch('compliance.service.elicensing_service.requests.get')
    def test_test_connection_success(self, mock_get):
        """Test the test_connection method when the connection is successful"""
        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'clientObjectId': '174044621',
            'businessAreaCode': 'CG',
            'companyName': 'Test Company'
        }
        mock_get.return_value = mock_response

        # Call the method
        result = elicensing_service.test_connection()

        # Check the result
        assert result['status'] == 'connected'
        assert 'Successfully connected' in result['message']
        assert result['api_response'] == 200
        assert 'client_data' in result
        assert result['client_data']['clientObjectId'] == '174044621'

    @patch('compliance.service.elicensing_service.requests.get')
    def test_test_connection_error(self, mock_get):
        """Test the test_connection method when there's an error"""
        # Mock the response to raise an exception
        mock_get.side_effect = Exception('Connection error')

        # Call the method
        result = elicensing_service.test_connection()

        # Check the result
        assert result['status'] == 'error'
        assert 'Failed to connect' in result['message']
        assert 'Connection error' in result['error']

    @patch('compliance.service.elicensing_service.requests.post')
    def test_create_client(self, mock_post):
        """Test the create_client method"""
        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'clientObjectId': '12345',
            'businessAreaCode': 'CG',
            'clientGUID': 'test-guid'
        }
        mock_post.return_value = mock_response

        # Call the method
        client_data = {
            'clientGUID': 'test-guid',
            'companyName': 'Test Company',
            'addressLine1': '123 Test St',
            'city': 'Test City',
            'stateProvince': 'BC',
            'postalCode': 'V1V 1V1'
        }
        result = elicensing_service.create_client(client_data)

        # Check the result
        assert result['clientObjectId'] == '12345'
        assert result['businessAreaCode'] == 'CG'
        assert result['clientGUID'] == 'test-guid'

        # Check that businessAreaCode was set to "CG"
        mock_post.assert_called_once()
        called_data = mock_post.call_args[1]['json']
        assert called_data['businessAreaCode'] == 'CG'

    @patch('compliance.service.elicensing_service.requests.get')
    def test_query_balance(self, mock_get):
        """Test the query_balance method"""
        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'clientObjectId': '12345',
            'balance': 100.00
        }
        mock_get.return_value = mock_response

        # Call the method
        result = elicensing_service.query_balance('12345')

        # Check the result
        assert result['clientObjectId'] == '12345'
        assert result['balance'] == 100.00

        # Check that the correct parameters were passed
        mock_get.assert_called_once()
        called_params = mock_get.call_args[1]['params']
        assert called_params['clientObjectId'] == '12345'

    @patch('compliance.service.elicensing_service.requests.get')
    def test_query_client(self, mock_get):
        """Test the query_client method"""
        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'clientObjectId': '174044621',
            'businessAreaCode': 'CG',
            'companyName': 'Test Company'
        }
        mock_get.return_value = mock_response

        # Call the method
        result = elicensing_service.query_client('174044621')

        # Check the result
        assert result['clientObjectId'] == '174044621'
        assert result['businessAreaCode'] == 'CG'
        assert result['companyName'] == 'Test Company'

        # Check that the correct parameters were passed
        mock_get.assert_called_once()
        called_params = mock_get.call_args[1]['params']
        assert called_params['clientObjectId'] == '174044621' 