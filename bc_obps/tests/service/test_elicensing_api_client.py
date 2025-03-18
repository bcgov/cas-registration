from unittest.mock import patch, MagicMock

import pytest
import requests

from service.elicensing_api_client import (
    ELicensingAPIClient,
)


@pytest.fixture
def mock_settings():
    with patch('service.elicensing_api_client.settings') as mock_settings:
        mock_settings.ELICENSING_API_URL = 'https://test-api.example.com'
        mock_settings.ELICENSING_AUTH_TOKEN = 'test-token'
        yield mock_settings


@pytest.fixture
def client_data():
    return {
        'clientGUID': 'test-guid',
        'companyName': 'Test Company',
        'addressLine1': '123 Test St',
        'city': 'Test City',
        'stateProvince': 'BC',
        'postalCode': 'V1A 1A1',
        'email': 'test@example.com',
    }


@pytest.fixture
def client_response_data():
    return {
        'clientObjectId': 'test-id',
        'clientGUID': 'test-guid',
        'companyName': 'Test Company',
        'addressLine1': '123 Test St',
        'city': 'Test City',
        'stateProvince': 'BC',
        'postalCode': 'V1A 1A1',
        'email': 'test@example.com',
    }


@pytest.fixture
def client_creation_response_data():
    return {
        'clientObjectId': 'test-id',
        'clientGUID': 'test-guid',
    }


class TestELicensingAPIClient:
    """Tests for the ELicensingAPIClient class"""

    def test_singleton_pattern(self, mock_settings):
        """Test that the class implements the singleton pattern correctly"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Create first instance
        client1 = ELicensingAPIClient()

        # Create second instance
        client2 = ELicensingAPIClient()

        # Both should be the same object
        assert client1 is client2

        # Check that settings were used correctly
        assert client1.base_url == 'https://test-api.example.com'
        assert client1.auth_token == 'test-token'

    def test_get_headers(self, mock_settings):
        """Test the _get_headers method"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        client = ELicensingAPIClient()
        headers = client._get_headers()

        assert headers == {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }

    @patch('service.elicensing_api_client.requests.get')
    def test_make_request_get(self, mock_get, mock_settings):
        """Test the _make_request method with GET"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'data': 'test'}
        mock_get.return_value = mock_response

        client = ELicensingAPIClient()
        response = client._make_request('/test', method='GET', params={'param': 'value'})

        # Check that requests.get was called correctly
        mock_get.assert_called_once_with(
            'https://test-api.example.com/test', headers=client._get_headers(), params={'param': 'value'}, timeout=30
        )

        # Check that we got the expected response
        assert response == mock_response

    @patch('service.elicensing_api_client.requests.post')
    def test_make_request_post(self, mock_post, mock_settings):
        """Test the _make_request method with POST"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'data': 'test'}
        mock_post.return_value = mock_response

        client = ELicensingAPIClient()
        response = client._make_request('/test', method='POST', data={'data': 'test'})

        # Check that requests.post was called correctly
        mock_post.assert_called_once_with(
            'https://test-api.example.com/test', headers=client._get_headers(), json={'data': 'test'}, timeout=30
        )

        # Check that we got the expected response
        assert response == mock_response

    @patch('service.elicensing_api_client.requests.put')
    def test_make_request_put(self, mock_put, mock_settings):
        """Test the _make_request method with PUT"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'data': 'test'}
        mock_put.return_value = mock_response

        client = ELicensingAPIClient()
        response = client._make_request('/test', method='PUT', data={'data': 'test'})

        # Check that requests.put was called correctly
        mock_put.assert_called_once_with(
            'https://test-api.example.com/test', headers=client._get_headers(), json={'data': 'test'}, timeout=30
        )

        # Check that we got the expected response
        assert response == mock_response

    @patch('service.elicensing_api_client.requests.get')
    def test_make_request_error_handling_json(self, mock_get, mock_settings):
        """Test error handling in _make_request with JSON error response"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = [{'message': 'Error message'}]
        mock_get.return_value = mock_response

        client = ELicensingAPIClient()
        response = client._make_request('/test', method='GET')

        # Check that we got the expected response
        assert response == mock_response

    @patch('service.elicensing_api_client.requests.get')
    def test_make_request_error_handling_text(self, mock_get, mock_settings):
        """Test error handling in _make_request with text error response"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.side_effect = ValueError('Invalid JSON')
        mock_response.text = 'Error message'
        mock_get.return_value = mock_response

        client = ELicensingAPIClient()
        response = client._make_request('/test', method='GET')

        # Check that we got the expected response
        assert response == mock_response

    @patch('service.elicensing_api_client.requests.get')
    def test_make_request_connection_error(self, mock_get, mock_settings):
        """Test connection error handling in _make_request"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock to raise an exception
        mock_get.side_effect = requests.RequestException('Connection error')

        client = ELicensingAPIClient()

        # Check that the exception is raised
        with pytest.raises(requests.RequestException):
            client._make_request('/test', method='GET')

    @patch('service.elicensing_api_client.requests.post')
    def test_create_client_success(self, mock_post, mock_settings, client_data, client_creation_response_data):
        """Test the create_client method success case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = client_creation_response_data
        mock_post.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.create_client(client_data)

        # Check that requests.post was called correctly
        mock_post.assert_called_once_with(
            'https://test-api.example.com/client', headers=client._get_headers(), json=client_data, timeout=30
        )

        # Check that we got the expected response
        assert response == client_creation_response_data

    @patch('service.elicensing_api_client.requests.post')
    def test_create_client_invalid_response(self, mock_post, mock_settings, client_data):
        """Test the create_client method with invalid response format"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response with invalid format
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'id': 'test-id'}  # Missing expected fields
        mock_post.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.create_client(client_data)

        # Check that we got a response with expected structure
        assert 'clientObjectId' in response
        assert 'clientGUID' in response
        assert response['clientObjectId'] == 'test-id'
        assert response['clientGUID'] == client_data['clientGUID']

    @patch('service.elicensing_api_client.requests.post')
    def test_create_client_error(self, mock_post, mock_settings, client_data):
        """Test the create_client method error case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response with error
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = {'message': 'Error creating client'}
        mock_response.raise_for_status.side_effect = requests.HTTPError('400 Client Error')
        mock_post.return_value = mock_response

        client = ELicensingAPIClient()

        # Check that the exception is raised
        with pytest.raises(requests.HTTPError):
            client.create_client(client_data)

    @patch('service.elicensing_api_client.requests.get')
    def test_query_client_success(self, mock_get, mock_settings, client_response_data):
        """Test the query_client method success case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = client_response_data
        mock_get.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.query_client('test-id')

        # Check that requests.get was called correctly
        mock_get.assert_called_once_with(
            'https://test-api.example.com/client/test-id', headers=client._get_headers(), params=None, timeout=30
        )

        # Check that we got the expected response
        assert response == client_response_data

    @patch('service.elicensing_api_client.requests.get')
    def test_query_client_invalid_response(self, mock_get, mock_settings):
        """Test the query_client method with invalid response format"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response with invalid format
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = 'not a dict'  # Invalid response format
        mock_get.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.query_client('test-id')

        # Check that we got a minimal valid response
        assert response['clientObjectId'] == 'test-id'
        assert response['clientGUID'] == ''
        assert response['companyName'] == ''
        assert response['addressLine1'] == ''
        assert response['city'] == ''
        assert response['stateProvince'] == ''
        assert response['postalCode'] == ''

    @patch('service.elicensing_api_client.requests.get')
    def test_query_client_error(self, mock_get, mock_settings):
        """Test the query_client method error case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response with error
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.json.return_value = {'message': 'Client not found'}
        mock_response.raise_for_status.side_effect = requests.HTTPError('404 Not Found')
        mock_get.return_value = mock_response

        client = ELicensingAPIClient()

        # Check that the exception is raised
        with pytest.raises(requests.HTTPError):
            client.query_client('test-id')

    @patch('service.elicensing_api_client.requests.put')
    def test_update_client_success(self, mock_put, mock_settings, client_data):
        """Test the update_client method success case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'status': 'success'}
        mock_put.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.update_client(client_data)

        # Check that businessAreaCode was added
        expected_data = client_data.copy()
        expected_data['businessAreaCode'] = 'CG'

        # Check that requests.put was called correctly
        mock_put.assert_called_once_with(
            'https://test-api.example.com/client', headers=client._get_headers(), json=expected_data, timeout=30
        )

        # Check that we got the expected response
        assert response == {'status': 'success'}

    @patch('service.elicensing_api_client.requests.put')
    def test_update_client_error(self, mock_put, mock_settings, client_data):
        """Test the update_client method error case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response with error
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = {'message': 'Error updating client'}
        mock_response.raise_for_status.side_effect = requests.HTTPError('400 Client Error')
        mock_put.return_value = mock_response

        client = ELicensingAPIClient()

        # Check that the exception is raised
        with pytest.raises(requests.HTTPError):
            client.update_client(client_data)

    @patch('service.elicensing_api_client.requests.get')
    def test_query_balance_success(self, mock_get, mock_settings):
        """Test the query_balance method success case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'balance': 100.00}
        mock_get.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.query_balance('test-id')

        # Check that requests.get was called correctly
        mock_get.assert_called_once_with(
            'https://test-api.example.com/balance',
            headers=client._get_headers(),
            params={'clientObjectId': 'test-id'},
            timeout=30,
        )

        # Check that we got the expected response
        assert response == {'balance': 100.00}

    @patch('service.elicensing_api_client.requests.post')
    def test_create_fees_success(self, mock_post, mock_settings):
        """Test the create_fees method success case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up test data
        fees_data = {'clientObjectId': 'test-id', 'fees': [{'amount': 100.00, 'description': 'Test fee'}]}

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'feeIds': ['fee-id-1']}
        mock_post.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.create_fees(fees_data)

        # Check that requests.post was called correctly
        mock_post.assert_called_once_with(
            'https://test-api.example.com/fees', headers=client._get_headers(), json=fees_data, timeout=30
        )

        # Check that we got the expected response
        assert response == {'feeIds': ['fee-id-1']}

    @patch('service.elicensing_api_client.requests.post')
    def test_adjust_fees_success(self, mock_post, mock_settings):
        """Test the adjust_fees method success case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up test data
        adjustment_data = {
            'clientObjectId': 'test-id',
            'feeId': 'fee-id-1',
            'adjustmentAmount': -50.00,
            'reason': 'Test adjustment',
        }

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'adjustmentId': 'adj-id-1'}
        mock_post.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.adjust_fees(adjustment_data)

        # Check that requests.post was called correctly
        mock_post.assert_called_once_with(
            'https://test-api.example.com/fees/adjust', headers=client._get_headers(), json=adjustment_data, timeout=30
        )

        # Check that we got the expected response
        assert response == {'adjustmentId': 'adj-id-1'}

    @patch('service.elicensing_api_client.requests.get')
    def test_query_fees_with_status(self, mock_get, mock_settings):
        """Test the query_fees method with status filter"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'fees': [{'id': 'fee-id-1', 'amount': 100.00}]}
        mock_get.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.query_fees('test-id', fee_status='UNPAID')

        # Check that requests.get was called correctly
        mock_get.assert_called_once_with(
            'https://test-api.example.com/fees',
            headers=client._get_headers(),
            params={'clientObjectId': 'test-id', 'feeStatus': 'UNPAID'},
            timeout=30,
        )

        # Check that we got the expected response
        assert response == {'fees': [{'id': 'fee-id-1', 'amount': 100.00}]}

    @patch('service.elicensing_api_client.requests.get')
    def test_query_invoice_success(self, mock_get, mock_settings):
        """Test the query_invoice method success case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'invoiceNumber': 'INV-001', 'amount': 100.00}
        mock_get.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.query_invoice('INV-001')

        # Check that requests.get was called correctly
        mock_get.assert_called_once_with(
            'https://test-api.example.com/invoice',
            headers=client._get_headers(),
            params={'invoiceNumber': 'INV-001'},
            timeout=30,
        )

        # Check that we got the expected response
        assert response == {'invoiceNumber': 'INV-001', 'amount': 100.00}

    @patch('service.elicensing_api_client.requests.post')
    def test_create_invoice_success(self, mock_post, mock_settings):
        """Test the create_invoice method success case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up test data
        invoice_data = {'clientObjectId': 'test-id', 'feeIds': ['fee-id-1', 'fee-id-2']}

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'invoiceNumber': 'INV-001', 'amount': 150.00}
        mock_post.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.create_invoice(invoice_data)

        # Check that requests.post was called correctly
        mock_post.assert_called_once_with(
            'https://test-api.example.com/invoice', headers=client._get_headers(), json=invoice_data, timeout=30
        )

        # Check that we got the expected response
        assert response == {'invoiceNumber': 'INV-001', 'amount': 150.00}
