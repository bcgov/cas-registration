import json
import logging
from typing import Dict, Any, Optional, cast
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

    def __new__(cls) -> 'ELicensingService':
        """Singleton pattern to ensure only one instance of ELicensingService is created"""
        if cls._instance is None:
            cls._instance = super(ELicensingService, cls).__new__(cls)

            # Get settings values
            base_url = settings.ELICENSING_API_URL
            token = settings.ELICENSING_AUTH_TOKEN

            # Ensure these are strings, not Optional[str]
            cls._instance.base_url = cast(str, base_url)
            cls._instance.token = cast(str, token)

            logger.info(f'Initializing ELicensingService to connect to {cls._instance.base_url}')
        return cls._instance

    def _get_headers(self) -> Dict[str, str]:
        """Get the headers for the API request"""
        return {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }

    def _make_request(
        self,
        endpoint: str,
        method: str = 'GET',
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
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
        logger.error(f"Making {method} request to {url} with data: {data} and params: {params}")
        headers = self._get_headers()

        try:
            if method == 'GET':
                if data:
                    # Special case: GET with body (unusual but required by this API)
                    # Convert data to a JSON string if it's a dictionary
                    json_data = json.dumps(data) if isinstance(data, dict) else data

                    response = requests.request(
                        method='GET',
                        url=url,
                        headers=headers,
                        data=json_data,  # Use data instead of json for raw string
                        params=params,
                        timeout=30,
                    )
                else:
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
                error_body = ""
                try:
                    error_body = response.json()
                except ValueError:
                    error_body = response.text or "No response body"

                logger.error(f"eLicensing API error: {response.status_code} - {error_body}")

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
        endpoint = "/client"

        # Ensure businessAreaCode is set to "CG" as required
        client_data['businessAreaCode'] = "CG"

        response = self._make_request(endpoint, method='POST', data=client_data)

        if response.status_code == 200:
            return cast(Dict[str, Any], response.json())
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
        endpoint = "/client"

        # Ensure businessAreaCode is set to "CG" as required
        client_data['businessAreaCode'] = "CG"

        response = self._make_request(endpoint, method='PUT', data=client_data)

        if response.status_code == 200:
            return cast(Dict[str, Any], response.json())
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
        endpoint = "/balance"
        params = {"clientObjectId": client_object_id}

        response = self._make_request(endpoint, method='GET', params=params)

        if response.status_code == 200:
            return cast(Dict[str, Any], response.json())
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
        endpoint = "/fees"

        response = self._make_request(endpoint, method='POST', data=fees_data)

        if response.status_code == 200:
            return cast(Dict[str, Any], response.json())
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
        endpoint = "/fees/adjust"

        response = self._make_request(endpoint, method='POST', data=adjustment_data)

        if response.status_code == 200:
            return cast(Dict[str, Any], response.json())
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
        endpoint = "/fees"
        params = {"clientObjectId": client_object_id}

        if fee_status:
            params["feeStatus"] = fee_status

        response = self._make_request(endpoint, method='GET', params=params)

        if response.status_code == 200:
            return cast(Dict[str, Any], response.json())
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
        endpoint = "/invoice"
        params = {"invoiceNumber": invoice_number}

        response = self._make_request(endpoint, method='GET', params=params)

        if response.status_code == 200:
            return cast(Dict[str, Any], response.json())
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
        endpoint = "/invoice"

        response = self._make_request(endpoint, method='POST', data=invoice_data)

        if response.status_code == 200:
            return cast(Dict[str, Any], response.json())
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
        endpoint = "/client"
        params = {"clientObjectId": client_object_id}

        response = self._make_request(endpoint, method='GET', params=params)

        if response.status_code == 200:
            return cast(Dict[str, Any], response.json())
        else:
            logger.error(f"Failed to query client: {response.text}")
            response.raise_for_status()
            return {}

    def test_connection(self) -> Dict[str, Any]:
        """
        Tests the connection to the eLicensing API.
        This is a simple method to verify that the service can connect to the API.
        Will be removed once the connection is confirmed.

        Returns:
            A dictionary with connection status information
        """
        try:
            # Try to query a specific client to test the connection
            client_id = "174044621"
            # Provide a non-empty body as required by the API
            response = self._make_request(f"/client/{client_id}", method='GET', data={"body": "{}"})

            if response.status_code == 200:
                client_data = response.json()
                return {
                    "status": "connected",
                    "message": "Successfully connected to eLicensing API and retrieved client data",
                    "api_response": response.status_code,
                    "client_data": client_data,
                }
            else:
                error_body = ""
                try:
                    error_body = response.json()
                except ValueError:
                    error_body = response.text or "No response body"

                return {
                    "status": "error",
                    "message": f"Error response from eLicensing API: {response.status_code}",
                    "api_response": response.status_code,
                    "error_details": error_body,
                }
        except Exception as e:
            return {"status": "error", "message": f"Failed to connect to eLicensing API: {str(e)}", "error": str(e)}


# Create a singleton instance
elicensing_service = ELicensingService()
