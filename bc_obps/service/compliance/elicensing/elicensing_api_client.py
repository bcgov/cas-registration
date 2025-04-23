import logging
from typing import Dict, Any, Optional, cast, List, Literal
import requests
from django.conf import settings
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class ClientResponse:
    """Type definition for the client response from eLicensing API"""

    clientObjectId: str
    clientGUID: str
    companyName: str
    lastName: Optional[str] = None
    doingBusinessAs: Optional[str] = None
    firstName: Optional[str] = None
    middleName: Optional[str] = None
    title: Optional[str] = None
    businessPhone: Optional[str] = None
    homeNumber: Optional[str] = None
    cellularNumber: Optional[str] = None
    faxNumber: Optional[str] = None
    businessPhoneExt: Optional[str] = None
    bcCompanyRegistrationNumber: Optional[str] = None
    bcCompanySocietyNumber: Optional[str] = None
    email: Optional[str] = None
    dateOfBirth: Optional[str] = None
    addressLine1: str = ""
    addressLine2: Optional[str] = None
    city: str = ""
    stateProvince: str = ""
    postalCode: str = ""
    country: Optional[str] = None


@dataclass
class ClientCreationResponse:
    """Type definition for the client creation response from eLicensing API"""

    clientObjectId: str
    clientGUID: str


@dataclass
class ClientCreationRequest:
    """Type definition for the client creation request to eLicensing API"""

    companyName: str
    addressLine1: str
    city: str
    stateProvince: str
    postalCode: str
    clientGUID: str
    businessAreaCode: str
    businessPhone: str
    lastName: Optional[str] = None
    doingBusinessAs: Optional[str] = None
    firstName: Optional[str] = None
    middleName: Optional[str] = None
    title: Optional[str] = None
    homeNumber: Optional[str] = None
    cellularNumber: Optional[str] = None
    faxNumber: Optional[str] = None
    businessPhoneExt: Optional[str] = None
    bcCompanyRegistrationNumber: Optional[str] = None
    bcCompanySocietyNumber: Optional[str] = None
    email: Optional[str] = None
    dateOfBirth: Optional[str] = None
    addressLine2: Optional[str] = None
    country: Optional[str] = None


# Valid fee profile group names in eLicensing
FeeProfileGroupName = Literal["OBPS Compliance Obligation", "OBPS Administrative Penalty"]


@dataclass
class FeeCreationItem:
    """Type definition for a fee item in the fee creation request"""

    businessAreaCode: str
    feeGUID: str
    feeProfileGroupName: FeeProfileGroupName  # Must be one of the valid profile group names
    feeDescription: str  # Mandatory field
    feeAmount: float
    feeDate: str  # Format: YYYY-MM-DD


@dataclass
class FeeCreationRequest:
    """Type definition for the fee creation request to eLicensing API"""

    fees: List[FeeCreationItem]


@dataclass
class FeeItem:
    """Type definition for a fee item in the eLicensing API response"""

    feeGUID: str
    feeObjectId: str
    businessAreaCode: Optional[str] = None
    feeProfileGroupName: Optional[str] = None
    feeDescription: Optional[str] = None
    feeAmount: Optional[float] = None
    feeDate: Optional[str] = None


@dataclass
class FeeResponse:
    """Type definition for the fee creation response from eLicensing API"""

    clientObjectId: str
    clientGUID: str
    fees: List[FeeItem]


@dataclass
class InvoiceResponse:
    clientObjectId: str
    businessAreaCode: str
    clientGUID: str
    invoiceNumber: str


@dataclass
class InvoiceCreationRequest:
    paymentDueDate: str
    businessAreaCode: str
    fees: List[str]


class ELicensingAPIError(Exception):
    """Exception for eLicensing API errors"""

    pass


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

    def create_client(self, client_data: ClientCreationRequest) -> ClientCreationResponse:
        """
        Creates a new client in the eLicensing system.

        Args:
            client_data: Client data according to the API specification

        Returns:
            Response data containing the clientObjectId and clientGUID

        Raises:
            requests.RequestException: If the API request fails
            requests.HTTPError: If the API returns an error response
        """
        endpoint = "/client"

        # Convert dataclass to dict for API request
        client_dict = {
            "companyName": client_data.companyName,
            "addressLine1": client_data.addressLine1,
            "city": client_data.city,
            "stateProvince": client_data.stateProvince,
            "postalCode": client_data.postalCode,
            "lastName": client_data.lastName,
            "doingBusinessAs": client_data.doingBusinessAs,
            "firstName": client_data.firstName,
            "middleName": client_data.middleName,
            "title": client_data.title,
            "businessPhone": client_data.businessPhone,
            "homeNumber": client_data.homeNumber,
            "cellularNumber": client_data.cellularNumber,
            "faxNumber": client_data.faxNumber,
            "businessPhoneExt": client_data.businessPhoneExt,
            "bcCompanyRegistrationNumber": client_data.bcCompanyRegistrationNumber,
            "bcCompanySocietyNumber": client_data.bcCompanySocietyNumber,
            "email": client_data.email,
            "dateOfBirth": client_data.dateOfBirth,
            "addressLine2": client_data.addressLine2,
            "country": client_data.country,
        }

        response = self._make_request(endpoint, method='POST', data=client_dict)
        response.raise_for_status()

        json_response = response.json()
        return ClientCreationResponse(
            clientObjectId=json_response['clientObjectId'], clientGUID=json_response['clientGUID']
        )

    def query_client(self, client_object_id: str) -> ClientResponse:
        """
        Queries a client by client object ID.

        Args:
            client_object_id: The client object ID

        Returns:
            Client information with detailed fields as defined in the API documentation

        Raises:
            requests.RequestException: If the API request fails
            ValueError: If the response format is invalid
            requests.HTTPError: If the API returns an error response
        """
        endpoint = f"/client/{client_object_id}"

        response = self._make_request(endpoint, method='GET')

        if response.status_code == 200:
            try:
                json_response = response.json()
                # Ensure the response has the expected structure
                if not isinstance(json_response, dict):
                    raise ValueError(f"Invalid response format: expected dict, got {type(json_response)}")

                # Validate required fields exist and aren't empty
                required_fields = [
                    'clientObjectId',
                    'clientGUID',
                    'companyName',
                    'addressLine1',
                    'city',
                    'stateProvince',
                    'postalCode',
                ]
                for field in required_fields:
                    if field not in json_response or not json_response[field]:
                        raise ValueError(f"Missing or empty required field '{field}' in response: {json_response}")

                return ClientResponse(**json_response)
            except ValueError as e:
                logger.error(f"Error with client query response: {str(e)}, Response: {response.text}")
                raise
            except Exception as e:
                logger.error(f"Error parsing client query response: {str(e)}, Response: {response.text}")
                raise ValueError(f"Failed to parse API response: {str(e)}")
        else:
            self._handle_error_response(response, "query client")
            # This line should never be reached due to raise_for_status in _handle_error_response
            raise RuntimeError("Unexpected code path - API error handling failed")

    def update_client(self, client_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Updates an existing client in the eLicensing system.

        Args:
            client_data: Client data according to the API specification

        Returns:
            Response data

        Raises:
            requests.RequestException: If the API request fails
            ValueError: If the response format is invalid
            requests.HTTPError: If the API returns an error response
        """
        endpoint = "/client"

        # Ensure businessAreaCode is set to "CG" as required
        client_data['businessAreaCode'] = "CG"

        response = self._make_request(endpoint, method='PUT', data=client_data)

        if response.status_code == 200:
            try:
                json_response = response.json()
                if not isinstance(json_response, dict):
                    raise ValueError(f"Invalid response format: expected dict, got {type(json_response)}")
                return cast(Dict[str, Any], json_response)
            except ValueError as e:
                logger.error(f"Error with client update response: {str(e)}, Response: {response.text}")
                raise
            except Exception as e:
                logger.error(f"Error parsing client update response: {str(e)}, Response: {response.text}")
                raise ValueError(f"Failed to parse API response: {str(e)}")
        else:
            self._handle_error_response(response, "update client")
            # This line should never be reached due to raise_for_status in _handle_error_response
            raise RuntimeError("Unexpected code path - API error handling failed")

    def query_balance(self, client_object_id: str) -> Dict[str, Any]:
        """
        Queries the balance for a client.

        Args:
            client_object_id: The client object ID

        Returns:
            Balance information

        Raises:
            requests.RequestException: If the API request fails
            ValueError: If the response format is invalid
            requests.HTTPError: If the API returns an error response
        """
        endpoint = "/balance"
        params = {"clientObjectId": client_object_id}

        response = self._make_request(endpoint, method='GET', params=params)

        if response.status_code == 200:
            try:
                json_response = response.json()
                if not isinstance(json_response, dict):
                    raise ValueError(f"Invalid response format: expected dict, got {type(json_response)}")
                return cast(Dict[str, Any], json_response)
            except ValueError as e:
                logger.error(f"Error with balance query response: {str(e)}, Response: {response.text}")
                raise
            except Exception as e:
                logger.error(f"Error parsing balance query response: {str(e)}, Response: {response.text}")
                raise ValueError(f"Failed to parse API response: {str(e)}")
        else:
            self._handle_error_response(response, "query balance")
            # This line should never be reached due to raise_for_status in _handle_error_response
            raise RuntimeError("Unexpected code path - API error handling failed")

    def create_fees(self, client_id: str, fees_data: FeeCreationRequest) -> FeeResponse:
        """
        Creates fee records for a specified client.

        Args:
            client_id: The client ID (can be either object ID or GUID)
            fees_data: Fee data containing an array of fee records

        Returns:
            FeeResponse: Response data containing clientObjectId, clientGUID, and an array of created fees

        Raises:
            requests.RequestException: If the API request fails
            requests.HTTPError: If the API returns an error response
        """
        endpoint = f"/client/{client_id}/fees"

        # Convert dataclass to dict for API request
        fees_dict = {
            "fees": [
                {
                    "businessAreaCode": fee.businessAreaCode,
                    "feeGUID": fee.feeGUID,
                    "feeProfileGroupName": fee.feeProfileGroupName,
                    "feeDescription": fee.feeDescription,
                    "feeAmount": fee.feeAmount,
                    "feeDate": fee.feeDate,
                }
                for fee in fees_data.fees
            ]
        }

        response = self._make_request(endpoint, method='POST', data=fees_dict)
        response.raise_for_status()

        json_response = response.json()
        fees = [FeeItem(**fee) for fee in json_response['fees']]

        return FeeResponse(
            clientObjectId=json_response['clientObjectId'], clientGUID=json_response['clientGUID'], fees=fees
        )

    def adjust_fees(self, adjustment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adjusts fees for a client.

        Args:
            adjustment_data: Adjustment data according to the API specification

        Returns:
            Response data

        Raises:
            requests.RequestException: If the API request fails
            ValueError: If the response format is invalid
            requests.HTTPError: If the API returns an error response
        """
        endpoint = "/fees/adjust"

        response = self._make_request(endpoint, method='POST', data=adjustment_data)

        if response.status_code == 200:
            try:
                json_response = response.json()
                if not isinstance(json_response, dict):
                    raise ValueError(f"Invalid response format: expected dict, got {type(json_response)}")
                return cast(Dict[str, Any], json_response)
            except ValueError as e:
                logger.error(f"Error with fees adjustment response: {str(e)}, Response: {response.text}")
                raise
            except Exception as e:
                logger.error(f"Error parsing fees adjustment response: {str(e)}, Response: {response.text}")
                raise ValueError(f"Failed to parse API response: {str(e)}")
        else:
            self._handle_error_response(response, "adjust fees")
            # This line should never be reached due to raise_for_status in _handle_error_response
            raise RuntimeError("Unexpected code path - API error handling failed")

    def query_fees(self, client_object_id: str, fee_status: Optional[str] = None) -> Dict[str, Any]:
        """
        Queries fees for a client.

        Args:
            client_object_id: The client object ID
            fee_status: Optional fee status filter

        Returns:
            Fees information

        Raises:
            requests.RequestException: If the API request fails
            ValueError: If the response format is invalid
            requests.HTTPError: If the API returns an error response
        """
        endpoint = "/fees"
        params = {"clientObjectId": client_object_id}

        if fee_status:
            params["feeStatus"] = fee_status

        response = self._make_request(endpoint, method='GET', params=params)

        if response.status_code == 200:
            try:
                json_response = response.json()
                if not isinstance(json_response, dict):
                    raise ValueError(f"Invalid response format: expected dict, got {type(json_response)}")
                return cast(Dict[str, Any], json_response)
            except ValueError as e:
                logger.error(f"Error with fees query response: {str(e)}, Response: {response.text}")
                raise
            except Exception as e:
                logger.error(f"Error parsing fees query response: {str(e)}, Response: {response.text}")
                raise ValueError(f"Failed to parse API response: {str(e)}")
        else:
            self._handle_error_response(response, "query fees")
            # This line should never be reached due to raise_for_status in _handle_error_response
            raise RuntimeError("Unexpected code path - API error handling failed")

    def query_invoice(self, invoice_number: str) -> Dict[str, Any]:
        """
        Queries an invoice by invoice number.

        Args:
            invoice_number: The invoice number

        Returns:
            Invoice information

        Raises:
            requests.RequestException: If the API request fails
            ValueError: If the response format is invalid
            requests.HTTPError: If the API returns an error response
        """
        endpoint = "/invoice"
        params = {"invoiceNumber": invoice_number}

        response = self._make_request(endpoint, method='GET', params=params)

        if response.status_code == 200:
            try:
                json_response = response.json()
                if not isinstance(json_response, dict):
                    raise ValueError(f"Invalid response format: expected dict, got {type(json_response)}")
                return cast(Dict[str, Any], json_response)
            except ValueError as e:
                logger.error(f"Error with invoice query response: {str(e)}, Response: {response.text}")
                raise
            except Exception as e:
                logger.error(f"Error parsing invoice query response: {str(e)}, Response: {response.text}")
                raise ValueError(f"Failed to parse API response: {str(e)}")
        else:
            self._handle_error_response(response, "query invoice")
            # This line should never be reached due to raise_for_status in _handle_error_response
            raise RuntimeError("Unexpected code path - API error handling failed")

    def create_invoice(self, client_id: str, invoice_data: InvoiceCreationRequest) -> InvoiceResponse:
        """
        Creates an invoice in eLicensing for a set of fees.

        Args:
            client_id: The ID of the client
            invoice_data: The invoice data to create

        Returns:
            InvoiceResponse: The response from the API

        Raises:
            requests.RequestException: If the API request fails
        """
        # Convert dataclass to dict for API request
        invoice_dict = {
            "paymentDueDate": invoice_data.paymentDueDate,
            "businessAreaCode": invoice_data.businessAreaCode,
            "fees": invoice_data.fees,
        }

        response = self._make_request(
            f"/client/{client_id}/invoice",
            method='POST',
            data=invoice_dict,
        )
        response.raise_for_status()
        json_response = response.json()
        return InvoiceResponse(**json_response)


# Create a singleton instance
elicensing_api_client = ELicensingAPIClient()
