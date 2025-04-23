from unittest.mock import patch, MagicMock
import pytest
import requests
from service.compliance.elicensing.elicensing_api_client import (
    ELicensingAPIClient,
    ClientCreationRequest,
    FeeCreationRequest,
    FeeCreationItem,
    InvoiceCreationRequest,
)


@pytest.fixture
def mock_settings():
    with patch('service.compliance.elicensing.elicensing_api_client.settings') as mock_settings:
        mock_settings.ELICENSING_API_URL = 'https://test-api.example.com'
        mock_settings.ELICENSING_AUTH_TOKEN = 'test-token'
        yield mock_settings


@pytest.fixture
def client_creation_request():
    return ClientCreationRequest(
        companyName='Test Company',
        addressLine1='123 Test St',
        city='Test City',
        stateProvince='BC',
        postalCode='V1A 1A1',
        clientGUID='test-guid',
        businessAreaCode='OBPS',
        businessPhone='123-456-7890',
        doingBusinessAs=None,
        bcCompanyRegistrationNumber=None,
        bcCompanySocietyNumber=None,
        country=None,
    )


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


@pytest.fixture
def fee_creation_request():
    return FeeCreationRequest(
        fees=[
            FeeCreationItem(
                businessAreaCode='OBPS',
                feeGUID='fee-guid-1',
                feeProfileGroupName='OBPS Compliance Obligation',
                feeDescription='Test Fee',
                feeAmount=100.00,
                feeDate='2024-03-20',
            )
        ]
    )


@pytest.fixture
def fee_response_data():
    return {
        'clientObjectId': 'test-id',
        'clientGUID': 'test-guid',
        'fees': [
            {
                'feeGUID': 'fee-guid-1',
                'feeObjectId': 'fee-id-1',
                'businessAreaCode': 'OBPS',
                'feeProfileGroupName': 'OBPS Compliance Obligation',
                'feeDescription': 'Test Fee',
                'feeAmount': 100.00,
                'feeDate': '2024-03-20',
            }
        ],
    }


@pytest.fixture
def invoice_creation_request():
    return InvoiceCreationRequest(
        paymentDueDate='2024-12-31',
        businessAreaCode='OBPS',
        fees=['fee-id-1', 'fee-id-2'],
    )


@pytest.fixture
def invoice_response_data():
    return {
        'clientObjectId': 'test-id',
        'businessAreaCode': 'OBPS',
        'clientGUID': 'test-guid',
        'invoiceNumber': 'INV-001',
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

    @patch('service.compliance.elicensing.elicensing_api_client.requests.get')
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

    @patch('service.compliance.elicensing.elicensing_api_client.requests.post')
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

    @patch('service.compliance.elicensing.elicensing_api_client.requests.put')
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

    @patch('service.compliance.elicensing.elicensing_api_client.requests.get')
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

    @patch('service.compliance.elicensing.elicensing_api_client.requests.get')
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

    @patch('service.compliance.elicensing.elicensing_api_client.requests.get')
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

    @patch('service.compliance.elicensing.elicensing_api_client.requests.post')
    def test_create_client_success(
        self, mock_post, mock_settings, client_creation_request, client_creation_response_data
    ):
        """Test the create_client method success case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = client_creation_response_data
        mock_post.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.create_client(client_creation_request)

        # Check that requests.post was called correctly
        mock_post.assert_called_once_with(
            'https://test-api.example.com/client',
            headers=client._get_headers(),
            json={
                'clientGUID': client_creation_request.clientGUID,
                'businessAreaCode': client_creation_request.businessAreaCode,
                'companyName': client_creation_request.companyName,
                'addressLine1': client_creation_request.addressLine1,
                'city': client_creation_request.city,
                'stateProvince': client_creation_request.stateProvince,
                'postalCode': client_creation_request.postalCode,
                'doingBusinessAs': client_creation_request.doingBusinessAs,
                'businessPhone': client_creation_request.businessPhone,
                'bcCompanyRegistrationNumber': client_creation_request.bcCompanyRegistrationNumber,
                'bcCompanySocietyNumber': client_creation_request.bcCompanySocietyNumber,
                'country': client_creation_request.country,
            },
            timeout=30,
        )

        # Check that we got the expected response
        assert response.clientObjectId == client_creation_response_data['clientObjectId']
        assert response.clientGUID == client_creation_response_data['clientGUID']

    @patch('service.compliance.elicensing.elicensing_api_client.requests.get')
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
            'https://test-api.example.com/client/test-id',
            headers=client._get_headers(),
            params=None,
            timeout=30,
        )

        # Check that we got the expected response
        assert response.clientObjectId == client_response_data['clientObjectId']
        assert response.clientGUID == client_response_data['clientGUID']
        assert response.companyName == client_response_data['companyName']
        assert response.addressLine1 == client_response_data['addressLine1']
        assert response.city == client_response_data['city']
        assert response.stateProvince == client_response_data['stateProvince']
        assert response.postalCode == client_response_data['postalCode']
        assert response.email == client_response_data['email']

    @patch('service.compliance.elicensing.elicensing_api_client.requests.get')
    def test_query_client_error(self, mock_get, mock_settings):
        """Test the query_client method error case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response with error
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = {'message': 'Client not found'}
        mock_response.raise_for_status.side_effect = requests.HTTPError('400 Client Error')
        mock_get.return_value = mock_response

        client = ELicensingAPIClient()

        # Check that the error is propagated
        with pytest.raises(requests.HTTPError):
            client.query_client('test-id')

    @patch('service.compliance.elicensing.elicensing_api_client.requests.post')
    def test_create_fees_success(self, mock_post, mock_settings, fee_creation_request, fee_response_data):
        """Test the create_fees method success case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = fee_response_data
        mock_post.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.create_fees('test-id', fee_creation_request)

        # Check that requests.post was called correctly
        mock_post.assert_called_once_with(
            'https://test-api.example.com/client/test-id/fees',
            headers=client._get_headers(),
            json={
                'fees': [
                    {
                        'businessAreaCode': fee.businessAreaCode,
                        'feeGUID': fee.feeGUID,
                        'feeProfileGroupName': fee.feeProfileGroupName,
                        'feeDescription': fee.feeDescription,
                        'feeAmount': fee.feeAmount,
                        'feeDate': fee.feeDate,
                    }
                    for fee in fee_creation_request.fees
                ]
            },
            timeout=30,
        )

        # Check that we got the expected response
        assert response.clientObjectId == fee_response_data['clientObjectId']
        assert response.clientGUID == fee_response_data['clientGUID']
        assert len(response.fees) == len(fee_response_data['fees'])
        for actual_fee, expected_fee in zip(response.fees, fee_response_data['fees']):
            assert actual_fee.feeGUID == expected_fee['feeGUID']
            assert actual_fee.feeObjectId == expected_fee['feeObjectId']
            assert actual_fee.businessAreaCode == expected_fee['businessAreaCode']
            assert actual_fee.feeProfileGroupName == expected_fee['feeProfileGroupName']
            assert actual_fee.feeDescription == expected_fee['feeDescription']
            assert actual_fee.feeAmount == expected_fee['feeAmount']
            assert actual_fee.feeDate == expected_fee['feeDate']

    @patch('service.compliance.elicensing.elicensing_api_client.requests.post')
    def test_create_fees_error(self, mock_post, mock_settings, fee_creation_request):
        """Test the create_fees method with error response"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response with error
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = {'message': 'Invalid fee data'}
        mock_response.raise_for_status.side_effect = requests.HTTPError("400 Client Error")
        mock_post.return_value = mock_response

        client = ELicensingAPIClient()

        # Check that the error is propagated
        with pytest.raises(requests.HTTPError):
            client.create_fees('test-id', fee_creation_request)

    @patch('service.compliance.elicensing.elicensing_api_client.requests.post')
    def test_create_invoice_success(self, mock_post, mock_settings, invoice_creation_request, invoice_response_data):
        """Test the create_invoice method success case"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = invoice_response_data
        mock_post.return_value = mock_response

        client = ELicensingAPIClient()
        response = client.create_invoice('test-id', invoice_creation_request)

        # Check that requests.post was called correctly
        mock_post.assert_called_once_with(
            'https://test-api.example.com/client/test-id/invoice',
            headers=client._get_headers(),
            json={
                'paymentDueDate': invoice_creation_request.paymentDueDate,
                'businessAreaCode': invoice_creation_request.businessAreaCode,
                'fees': invoice_creation_request.fees,
            },
            timeout=30,
        )

        # Check that we got the expected response
        assert response.clientObjectId == invoice_response_data['clientObjectId']
        assert response.businessAreaCode == invoice_response_data['businessAreaCode']
        assert response.clientGUID == invoice_response_data['clientGUID']
        assert response.invoiceNumber == invoice_response_data['invoiceNumber']

    @patch('service.compliance.elicensing.elicensing_api_client.requests.post')
    def test_create_invoice_error(self, mock_post, mock_settings, invoice_creation_request):
        """Test the create_invoice method with error response"""
        # Reset the singleton instance for testing
        ELicensingAPIClient._instance = None

        # Set up mock response with error
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = {'message': 'Invalid invoice data'}
        mock_response.raise_for_status.side_effect = requests.HTTPError("400 Client Error")
        mock_post.return_value = mock_response

        client = ELicensingAPIClient()

        # Check that the error is propagated
        with pytest.raises(requests.HTTPError):
            client.create_invoice('test-id', invoice_creation_request)
