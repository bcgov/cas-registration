import json
import logging
import os
from typing import Dict, Any, Optional, Union
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

class ELicensingService:
    """
    Service for communicating with the eLicensing API.
    This service handles all interactions with the eLicensing API endpoints.
    """
    _instance = None
    
    # Base URL for the eLicensing API
    base_url: str
    # Bearer token for authentication
    token: str
    
    def __new__(cls):
        """Singleton pattern to ensure only one instance of ELicensingService is created"""
        if cls._instance is None:
            cls._instance = super(ELicensingService, cls).__new__(cls)
            
            # Get environment variables or use defaults for development
            cls._instance.base_url = os.environ.get('ELICENSING_BASE_URL', 'https://test.j200.gov.bc.ca')
            cls._instance.token = os.environ.get('ELICENSING_TOKEN')
            
            logger.info(f'Initializing ELicensingService to connect to {cls._instance.base_url}')
        return cls._instance
    
    def _get_headers(self) -> Dict[str, str]:
        """Get the headers for the API request"""
        return {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
    
    def _make_request(
        self, 
        endpoint: str, 
        method: str = 'GET', 
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> requests.Response:
        """
        Helper function to build and send HTTP requests to the eLicensing API with appropriate headers.
        
        Args:
            endpoint: The API endpoint to call (without the base URL)
            method: HTTP method (GET, POST, PUT, etc.)
            data: Request body for POST/PUT requests
            params: Query parameters for GET requests
            
        Returns:
            Response object from the requests library
        """
        url = f"{self.base_url}{endpoint}"
        headers = self._get_headers()
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == 'POST':
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, headers=headers, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            # Log the response status
            logger.info(f"eLicensing API {method} request to {endpoint} - Status: {response.status_code}")
            
            # Check for error responses
            if response.status_code >= 400:
                logger.error(f"eLicensing API error: {response.status_code} - {response.text}")
            
            return response
            
        except requests.RequestException as e:
            logger.error(f"eLicensing API request failed: {str(e)}")
            raise
    
    def create_client(self, client_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a new client in the eLicensing system.
        
        Args:
            client_data: Client data according to the API specification
            
        Returns:
            Response data containing the clientObjectId
        """
        endpoint = "/ws/finance/client"
        
        # Ensure businessAreaCode is set to "CG" as required
        client_data['businessAreaCode'] = "CG"
        
        response = self._make_request(endpoint, method='POST', data=client_data)
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to create client: {response.text}")
            response.raise_for_status()
            return {}
    
    def update_client(self, client_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Updates an existing client in the eLicensing system.
        
        Args:
            client_data: Client data according to the API specification
            
        Returns:
            Response data
        """
        endpoint = "/ws/finance/client"
        
        # Ensure businessAreaCode is set to "CG" as required
        client_data['businessAreaCode'] = "CG"
        
        response = self._make_request(endpoint, method='PUT', data=client_data)
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to update client: {response.text}")
            response.raise_for_status()
            return {}
    
    def query_balance(self, client_object_id: str) -> Dict[str, Any]:
        """
        Queries the balance for a client.
        
        Args:
            client_object_id: The client object ID
            
        Returns:
            Balance information
        """
        endpoint = "/ws/finance/balance"
        params = {"clientObjectId": client_object_id}
        
        response = self._make_request(endpoint, method='GET', params=params)
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to query balance: {response.text}")
            response.raise_for_status()
            return {}
    
    def create_fees(self, fees_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates fees for a client.
        
        Args:
            fees_data: Fees data according to the API specification
            
        Returns:
            Response data
        """
        endpoint = "/ws/finance/fees"
        
        response = self._make_request(endpoint, method='POST', data=fees_data)
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to create fees: {response.text}")
            response.raise_for_status()
            return {}
    
    def adjust_fees(self, adjustment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adjusts fees for a client.
        
        Args:
            adjustment_data: Adjustment data according to the API specification
            
        Returns:
            Response data
        """
        endpoint = "/ws/finance/fees/adjust"
        
        response = self._make_request(endpoint, method='POST', data=adjustment_data)
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to adjust fees: {response.text}")
            response.raise_for_status()
            return {}
    
    def query_fees(self, client_object_id: str, fee_status: Optional[str] = None) -> Dict[str, Any]:
        """
        Queries fees for a client.
        
        Args:
            client_object_id: The client object ID
            fee_status: Optional fee status filter
            
        Returns:
            Fees information
        """
        endpoint = "/ws/finance/fees"
        params = {"clientObjectId": client_object_id}
        
        if fee_status:
            params["feeStatus"] = fee_status
        
        response = self._make_request(endpoint, method='GET', params=params)
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to query fees: {response.text}")
            response.raise_for_status()
            return {}
    
    def query_invoice(self, invoice_number: str) -> Dict[str, Any]:
        """
        Queries an invoice by invoice number.
        
        Args:
            invoice_number: The invoice number
            
        Returns:
            Invoice information
        """
        endpoint = "/ws/finance/invoice"
        params = {"invoiceNumber": invoice_number}
        
        response = self._make_request(endpoint, method='GET', params=params)
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to query invoice: {response.text}")
            response.raise_for_status()
            return {}
    
    def create_invoice(self, invoice_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates an invoice.
        
        Args:
            invoice_data: Invoice data according to the API specification
            
        Returns:
            Response data
        """
        endpoint = "/ws/finance/invoice"
        
        response = self._make_request(endpoint, method='POST', data=invoice_data)
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to create invoice: {response.text}")
            response.raise_for_status()
            return {}
    
    def query_client(self, client_object_id: str) -> Dict[str, Any]:
        """
        Queries a client by client object ID.
        
        Args:
            client_object_id: The client object ID
            
        Returns:
            Client information
        """
        endpoint = "/ws/finance/client"
        params = {"clientObjectId": client_object_id}
        
        response = self._make_request(endpoint, method='GET', params=params)
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to query client: {response.text}")
            response.raise_for_status()
            return {}
    
    def test_connection(self) -> Dict[str, Any]:
        """
        Tests the connection to the eLicensing API.
        This is a simple method to verify that the service can connect to the API.
        
        Returns:
            A dictionary with connection status information
        """
        try:
            # Try to query a specific client to test the connection
            client_object_id = "174044621"
            response = self._make_request("/ws/finance/client", method='GET', params={"clientObjectId": client_object_id})
            
            if response.status_code == 200:
                client_data = response.json()
                return {
                    "status": "connected",
                    "message": "Successfully connected to eLicensing API and retrieved client data",
                    "api_response": response.status_code,
                    "client_data": client_data
                }
            else:
                return {
                    "status": "error",
                    "message": f"Error response from eLicensing API: {response.status_code}",
                    "api_response": response.status_code,
                    "error_details": response.text
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to eLicensing API: {str(e)}",
                "error": str(e)
            }

# Create a singleton instance
elicensing_service = ELicensingService() 