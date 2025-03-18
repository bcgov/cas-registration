import logging
from typing import Dict, Any, Optional, cast, TypedDict
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class ClientResponse(TypedDict, total=False):
    """Type definition for the client response from eLicensing API"""

    clientObjectId: str
    clientGUID: str
    companyName: str
    lastName: Optional[str]
    doingBusinessAs: Optional[str]
    firstName: Optional[str]
    middleName: Optional[str]
    title: Optional[str]
    businessPhone: Optional[str]
    homeNumber: Optional[str]
    cellularNumber: Optional[str]
    faxNumber: Optional[str]
    businessPhoneExt: Optional[str]
    bcCompanyRegistrationNumber: Optional[str]
    bcCompanySocietyNumber: Optional[str]
    email: Optional[str]
    dateOfBirth: Optional[str]
    addressLine1: str
    addressLine2: Optional[str]
    city: str
    stateProvince: str
    postalCode: str
    country: Optional[str]


class ClientCreationResponse(TypedDict):
    """Type definition for the client creation response from eLicensing API"""

    clientObjectId: str
    clientGUID: str


class ELicensingAPIClient:
    """
    Client for communicating with the eLicensing API.
    This client handles all low-level interactions with the eLicensing API endpoints.
    """

    _instance = None

    base_url: str
    auth_token: str

    def __new__(cls) -> 'ELicensingAPIClient':
        """Singleton pattern to ensure only one instance of ELicensingAPIClient is created"""
        if cls._instance is None:
            cls._instance = super(ELicensingAPIClient, cls).__new__(cls)

            # Get settings values
            base_url = settings.ELICENSING_API_URL
            token = settings.ELICENSING_AUTH_TOKEN

            # Ensure these are strings
            cls._instance.base_url = cast(str, base_url)
            cls._instance.auth_token = cast(str, token)

            logger.info(f'Initializing ELicensingAPIClient to connect to {cls._instance.base_url}')
        return cls._instance

    def _get_headers(self) -> Dict[str, str]:
        """Get the headers for the API request"""
        return {
            'Authorization': f'Bearer {self.auth_token}',
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

            logger.info(f"eLicensing API {method} request to {endpoint} - Status: {response.status_code}")

            # Check for error responses
            if response.status_code >= 400:
                error_body = ""
                try:
                    error_body = response.json()
                    # Handle the case where error body is an array of error objects
                    if isinstance(error_body, list) and len(error_body) > 0:
                        error_messages = [
                            f"{err.get('message', 'Unknown error')}" for err in error_body if isinstance(err, dict)
                        ]
                        if error_messages:
                            error_body = f"Errors: {'; '.join(error_messages)}"
                except ValueError:
                    error_body = response.text or "No response body"

                logger.error(f"eLicensing API error: {response.status_code} - {error_body}")

            return response

        except requests.RequestException as e:
            logger.error(f"eLicensing API request failed: {str(e)}")
            raise

    def _handle_error_response(self, response: requests.Response, operation_name: str) -> None:
        """
        Helper method to handle error responses consistently across API methods.

        Args:
            response: The response from the API
            operation_name: Name of the operation (for error messages)
        """
        error_message = f"Failed to {operation_name}"
        try:
            error_body = response.json()
            # Handle case where error is returned as an array of error objects
            if isinstance(error_body, list) and len(error_body) > 0:
                error_messages = [
                    f"{err.get('message', 'Unknown error')}" for err in error_body if isinstance(err, dict)
                ]
                if error_messages:
                    error_message = f"Failed to {operation_name}: {'; '.join(error_messages)}"
            elif isinstance(error_body, dict) and 'message' in error_body:
                error_message = f"Failed to {operation_name}: {error_body['message']}"
            else:
                error_message = f"Failed to {operation_name}: {error_body}"
        except ValueError:
            error_message = f"Failed to {operation_name}: {response.text}"

        logger.error(error_message)
        response.raise_for_status()

    def create_client(self, client_data: Dict[str, Any]) -> ClientCreationResponse:
        """
        Creates a new client in the eLicensing system.

        Args:
            client_data: Client data according to the API specification

        Returns:
            Response data containing the clientObjectId and clientGUID
        """
        endpoint = "/client"

        response = self._make_request(endpoint, method='POST', data=client_data)

        if response.status_code == 200:
            try:
                json_response = response.json()
                # Ensure the response has the expected fields
                if (
                    not isinstance(json_response, dict)
                    or 'clientObjectId' not in json_response
                    or 'clientGUID' not in json_response
                ):
                    logger.error(f"Invalid client creation response format: {json_response}")
                    # Return response using the provided GUID from the request
                    return {
                        'clientObjectId': json_response.get('id', ''),
                        'clientGUID': client_data.get('clientGUID', ''),
                    }
                return cast(ClientCreationResponse, json_response)
            except Exception as e:
                logger.error(f"Error parsing client creation response: {str(e)}, Response: {response.text}")
                # Return response using the provided GUID as fallback
                return {'clientObjectId': '', 'clientGUID': client_data.get('clientGUID', '')}
        else:
            self._handle_error_response(response, "create client")
            # This line should never be reached due to raise_for_status, but keeping for type checking
            return {'clientObjectId': '', 'clientGUID': client_data.get('clientGUID', '')}

    def query_client(self, client_object_id: str) -> ClientResponse:
        """
        Queries a client by client object ID.

        Args:
            client_object_id: The client object ID

        Returns:
            Client information with detailed fields as defined in the API documentation
        """
        endpoint = f"/client/{client_object_id}"

        response = self._make_request(endpoint, method='GET')

        if response.status_code == 200:
            try:
                json_response = response.json()
                # Ensure the response has the expected structure
                if not isinstance(json_response, dict):
                    logger.error(f"Invalid client query response format: {json_response}")
                    # Return a minimal valid response
                    return {
                        'clientObjectId': client_object_id,
                        'clientGUID': '',
                        'companyName': '',
                        'addressLine1': '',
                        'city': '',
                        'stateProvince': '',
                        'postalCode': '',
                    }
                return cast(ClientResponse, json_response)
            except Exception as e:
                logger.error(f"Error parsing client query response: {str(e)}, Response: {response.text}")
                # Return a minimal valid response
                return {
                    'clientObjectId': client_object_id,
                    'clientGUID': '',
                    'companyName': '',
                    'addressLine1': '',
                    'city': '',
                    'stateProvince': '',
                    'postalCode': '',
                }
        else:
            self._handle_error_response(response, "query client")
            # This line should never be reached due to raise_for_status
            return {
                'clientObjectId': client_object_id,
                'clientGUID': '',
                'companyName': '',
                'addressLine1': '',
                'city': '',
                'stateProvince': '',
                'postalCode': '',
            }

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
            self._handle_error_response(response, "update client")
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
            self._handle_error_response(response, "query balance")
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
            self._handle_error_response(response, "create fees")
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
            self._handle_error_response(response, "adjust fees")
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
            self._handle_error_response(response, "query fees")
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
            self._handle_error_response(response, "query invoice")
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
            self._handle_error_response(response, "create invoice")
            return {}


# Create a singleton instance
elicensing_api_client = ELicensingAPIClient()
