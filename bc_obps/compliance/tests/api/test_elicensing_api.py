import pytest
from unittest.mock import patch, MagicMock
from django.test import Client
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestELicensingAPI(CommonTestSetup):
    """Tests for the eLicensing API endpoints"""
    
    client = Client()
    
    @patch('compliance.service.elicensing_service.elicensing_service.test_connection')
    def test_test_connection_endpoint(self, mock_test_connection):
        """Test the test_connection endpoint"""
        # Mock the service method
        mock_test_connection.return_value = {
            'status': 'connected',
            'message': 'Successfully connected to eLicensing API and retrieved client data',
            'api_response': 200,
            'client_data': {
                'clientObjectId': '174044621',
                'businessAreaCode': 'CG',
                'companyName': 'Test Company'
            }
        }
        
        # Set up the test user
        self.setup_user()
        
        # Call the endpoint
        response = TestUtils.client.get(
            '/api/compliance/elicensing/test-connection',
            HTTP_AUTHORIZATION=self.auth_header_dumps
        )
        
        # Check the response
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'connected'
        assert 'Successfully connected' in data['message']
        assert data['api_response'] == 200
        assert 'client_data' in data
        assert data['client_data']['clientObjectId'] == '174044621'
        
        # Verify the service method was called
        mock_test_connection.assert_called_once()
    
    @patch('compliance.service.elicensing_service.elicensing_service.query_client')
    def test_query_client_endpoint(self, mock_query_client):
        """Test the query_client endpoint"""
        # Mock the service method
        mock_query_client.return_value = {
            'clientObjectId': '174044621',
            'businessAreaCode': 'CG',
            'companyName': 'Test Company'
        }
        
        # Set up the test user
        self.setup_user()
        
        # Call the endpoint
        response = TestUtils.client.get(
            '/api/compliance/elicensing/client/174044621',
            HTTP_AUTHORIZATION=self.auth_header_dumps
        )
        
        # Check the response
        assert response.status_code == 200
        data = response.json()
        assert data['clientObjectId'] == '174044621'
        assert data['businessAreaCode'] == 'CG'
        assert data['companyName'] == 'Test Company'
        
        # Verify the service method was called with the correct parameters
        mock_query_client.assert_called_once_with('174044621')
    
    @patch('compliance.service.elicensing_service.elicensing_service.query_balance')
    def test_query_balance_endpoint(self, mock_query_balance):
        """Test the query_balance endpoint"""
        # Mock the service method
        mock_query_balance.return_value = {
            'clientObjectId': '12345',
            'balance': 100.00
        }
        
        # Set up the test user
        self.setup_user()
        
        # Call the endpoint
        response = TestUtils.client.get(
            '/api/compliance/elicensing/client/12345/balance',
            HTTP_AUTHORIZATION=self.auth_header_dumps
        )
        
        # Check the response
        assert response.status_code == 200
        data = response.json()
        assert data['clientObjectId'] == '12345'
        assert data['balance'] == 100.00
        
        # Verify the service method was called with the correct parameters
        mock_query_balance.assert_called_once_with('12345') 