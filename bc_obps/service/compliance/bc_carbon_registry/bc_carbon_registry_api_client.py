import requests
import logging
from zoneinfo import ZoneInfo
from typing import Dict, Optional, Type, Any
from datetime import datetime, timedelta
from django.conf import settings
from pydantic import BaseModel, ValidationError
from service.compliance.bc_carbon_registry.exceptions import BCCarbonRegistryError
from service.compliance.bc_carbon_registry.schema import (
    TokenResponse,
    SearchFilter,
    Pagination,
    FilterModel,
    ColumnFilter,
    AccountDetailsResponse,
    UnitDetailsResponse,
    ProjectDetailsResponse,
    ProjectPayload,
    TransferPayload,
    GenericResponse,
    IssuancePayload,
    SubAccountPayload,
)
from requests.exceptions import Timeout, ConnectionError, HTTPError, RequestException

logger = logging.getLogger(__name__)


class BCCarbonRegistryAPIClient:
    """
    Client for interacting with the BC Carbon Registry API.
    """

    _instance = None
    token: Optional[str]
    api_url: Optional[str]
    client_id: Optional[str]
    client_secret: Optional[str]
    token_expiry: Optional[datetime] = None

    def __new__(cls) -> 'BCCarbonRegistryAPIClient':
        if cls._instance is None:
            cls._instance = super(BCCarbonRegistryAPIClient, cls).__new__(cls)
            cls._instance.api_url = settings.BCCR_API_URL.rstrip("/") if settings.BCCR_API_URL else None
            cls._instance.client_id = settings.BCCR_CLIENT_ID
            cls._instance.client_secret = settings.BCCR_CLIENT_SECRET
            logger.info(
                f'Initializing BCCarbonRegistryAPIClient for clientID {cls._instance.client_id} to connect to {cls._instance.api_url}'
            )
        return cls._instance

    def _validate_config(self) -> None:
        if not all([self.api_url, self.client_id, self.client_secret]):
            logger.error("Cannot authenticate: missing base_url, client_id, or client_secret")
            raise BCCarbonRegistryError("Authentication not possible due to missing configuration")

    def _authenticate(self) -> None:
        """
        Obtain JWT token for authentication.
        """
        self._validate_config()
        url = f"{self.api_url}/user-api/okta/token"

        try:
            response = requests.post(
                url, json={"clientId": self.client_id, "clientSecret": self.client_secret}, timeout=(3, 7)
            )  # 3s connect, 7s read
            response.raise_for_status()
            data = TokenResponse(**response.json())
            self.token = data.access_token
            self.token_expiry = datetime.now(ZoneInfo("UTC")) + timedelta(seconds=data.expires_in)
        except Timeout as e:
            logger.error("Authentication timed out: %s", str(e), exc_info=True)
            raise BCCarbonRegistryError(f"Request timed out: {str(e)}", endpoint=url) from e
        except ConnectionError as e:
            logger.error("Authentication failed due to connection error: %s", str(e), exc_info=True)
            raise BCCarbonRegistryError(f"Connection error: {str(e)}", endpoint=url) from e
        except HTTPError as e:
            logger.error(
                "Authentication failed with HTTP error: %s, response: %s", str(e), response.text, exc_info=True
            )
            raise BCCarbonRegistryError(f"HTTP error: {str(e)}", endpoint=url) from e
        except (ValidationError, RequestException) as e:
            logger.error("Authentication failed: %s", str(e), exc_info=True)
            raise BCCarbonRegistryError(f"Invalid token response: {str(e)}", endpoint=url) from e

    def _ensure_authenticated(self) -> None:
        """
        Ensure a valid token is available before requests.
        """
        token = getattr(self, "token", None)
        token_expiry = getattr(self, "token_expiry", None)
        if token is None or token_expiry is None or datetime.now(ZoneInfo("UTC")) >= token_expiry:
            logger.warning("Token missing or expired. Re-authenticating.")
            self._authenticate()

    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[BaseModel] = None,
        params: Optional[Dict] = None,
        response_model: Optional[type[BaseModel]] = None,
    ) -> Dict:
        """
        Make an authenticated API request.
        :param method: HTTP method (GET, POST, etc.)
        :param endpoint: API endpoint to call.
        :param data: Data to send in the request body (optional).
        :param params: Query parameters (optional).
        :param response_model: Pydantic model to validate the response (optional).
        :return: Parsed JSON response.
        """
        self._ensure_authenticated()
        headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
        url = f"{self.api_url}{endpoint}"

        json_data = data.model_dump_json() if data else None
        try:
            response = requests.request(method=method, url=url, headers=headers, json=json_data, params=params)
            response.raise_for_status()
            response_json = response.json()
            if response_model:
                validated_response = response_model(**response_json).model_dump()
            else:
                validated_response = response_json
            return validated_response
        except requests.RequestException as e:
            logger.error("Request to %s failed: %s", url, str(e), exc_info=True)
            raise BCCarbonRegistryError(f"Request failed: {str(e)}", endpoint=url) from e
        except ValidationError as e:
            logger.error("Invalid response from %s: %s", url, str(e), exc_info=True)
            raise BCCarbonRegistryError(f"Invalid response format: {str(e)}", endpoint=url) from e

    def _submit_payload(
        self,
        data: Dict,
        url: str,
        payload_model: Type[Any],
        response_model: Optional[type[BaseModel]] = GenericResponse,
        error_message: str = "Invalid payload",
    ) -> Dict:
        """
        Validate a payload and submit it to the specified URL.

        :param data: Dictionary containing payload data.
        :param url: API endpoint URL.
        :param payload_model: Pydantic model to validate the payload.
        :param response_model: Pydantic model for the response (default: GenericResponse).
        :param error_message: Custom error message for validation errors.
        :return: Response dictionary.
        :raises BCCarbonRegistryError: If payload validation fails.
        """
        try:
            payload = payload_model(**data)
        except ValidationError as e:
            raise BCCarbonRegistryError(f"{error_message}: {str(e)}") from e
        return self._make_request("POST", url, data=payload, response_model=response_model)

    def get_account_details(self, account_id: str) -> Dict:
        """
        Retrieves account details for the given account ID. This endpoint works for both compliance and holding accounts.
        :param account_id: The ID of the account to retrieve.
        """
        url = "/raas-report-api/es/account/pagePrivateSearchByFilter"
        if not account_id.isdigit():
            logger.error("Invalid account_id: %s", account_id)
            raise ValueError("account_id must be a numeric string")
        payload = SearchFilter(
            pagination=Pagination(),
            filterModel=FilterModel(
                entityId={"columnFilters": [ColumnFilter(filterType="Number", type="equals", filter=account_id)]}
            ),
        )
        return self._make_request("POST", url, data=payload, response_model=AccountDetailsResponse)

    def list_all_accounts(self, limit: int = 20, start: int = 0) -> Dict:
        """
        List all accounts.
        :param limit: Number of accounts to retrieve.
        :param start: Starting index for pagination.
        NOTE: We can extend filterModel to filter by different options in the future. (e.g. accountTypeId, entityId, etc.)
        """
        url = "/raas-report-api/es/account/pagePrivateSearchByFilter"
        if limit < 1 or start < 0:
            logger.error("Invalid pagination parameters: limit=%s, start=%s", limit, start)
            raise ValueError("limit must be positive and start non-negative")
        payload = SearchFilter(pagination=Pagination(start=start, limit=limit))
        return self._make_request("POST", url, data=payload, response_model=AccountDetailsResponse)

    def list_holding_accounts(self, compliance_account_id: str, limit: int = 20, start: int = 0) -> Dict:
        """
        Lists all holding accounts associated with a compliance account.
        :param compliance_account_id: The ID of the compliance account.
        :param limit: Number of holding accounts to retrieve.
        :param start: Starting index for pagination.

        Account Types - ID:
        Project Proponent - 2
        Validator/Verifier - 6
        Program Administrator - 7
        General Participant - 10
        Operator of Regulated Operation - 11
        Compliance - 14
        """
        url = "/es/account/pagePrivateSearchByFilter"
        COMPLIANCE_ACCOUNT_TYPE_ID = "14"
        if not compliance_account_id.isdigit():
            logger.error("Invalid compliance_account_id: %s", compliance_account_id)
            raise ValueError("compliance_account_id must be a numeric string")
        payload = SearchFilter(
            pagination=Pagination(start=start, limit=limit),
            filterModel=FilterModel(
                accountTypeId={
                    "columnFilters": [ColumnFilter(filterType="Text", type="in", filter=COMPLIANCE_ACCOUNT_TYPE_ID)]
                },
                masterAccountId={
                    "columnFilters": [ColumnFilter(filterType="Text", type="in", filter=compliance_account_id)]
                },
            ),
        )
        return self._make_request("POST", url, data=payload, response_model=AccountDetailsResponse)

    def list_all_units(self, account_id: str, limit: int = 20, start: int = 0) -> Dict:
        """
        List compliance units for a given account.
        """
        url = "/raas-report-api/es/unit/pagePrivateSearchByFilter"
        if not account_id.isdigit():
            logger.error("Invalid account_id: %s", account_id)
            raise ValueError("account_id must be a numeric string")
        payload = SearchFilter(
            pagination=Pagination(start=start, limit=limit),
            filterModel=FilterModel(
                accountId={"columnFilters": [ColumnFilter(filterType="Number", type="equals", filter=account_id)]}
            ),
        )
        return self._make_request(
            "POST",
            url,
            data=payload,
            response_model=UnitDetailsResponse,
        )

    def get_project_details(self, project_id: str) -> Dict:
        """Get project details by project ID."""
        url = f"/raas-project-api/project-manager/getById/{project_id}"
        if not project_id.isdigit():
            logger.error("Invalid project_id: %s", project_id)
            raise ValueError("project_id must be a numeric string")
        return self._make_request("POST", url, response_model=ProjectDetailsResponse)

    def create_project(self, project_data: Dict) -> Dict:
        """Create a new project"""
        return self._submit_payload(
            data=project_data,
            url="/raas-project-api/project-manager/project",
            payload_model=ProjectPayload,
            error_message="Invalid project payload",
        )

    def transfer_compliance_units(self, transfer_data: Dict) -> Dict:
        """
        Transfers compliance units from a holding account to a compliance account.

        The credits enter the transfer workflow.
        In the case of a full transfer, the status of the credits changes from Active to Pending Review (XXX),
        where XXX represents the next actor in the workflow.
        In the case of a partial transfer, the serial number is split into two based on the transfer quantity,
        and a new unit is created with the new quantity, entering the workflow.
        The existing record is updated with the remaining quantity and stays in Active status.

        :param transfer_data: Dictionary containing transfer details.
        """
        return self._submit_payload(
            data=transfer_data,
            url="/raas-credit-api/transfer-manager/doSubmit",
            payload_model=TransferPayload,
            error_message="Invalid transfer payload",
        )

    def create_issuance(self, issuance_data: Dict) -> Dict:
        """
        Create an issuance.
        An issuance record is created in Draft status along with units are created with the holding_quantity mentioned in payload in NEW status.
        """
        return self._submit_payload(
            data=issuance_data,
            url="/br-reg/rest/market-issuance-manager/save",
            payload_model=IssuancePayload,
            error_message="Invalid issuance payload",
        )

    def create_sub_account(self, sub_account_data: Dict) -> Dict:
        """Create a subaccount in holding account"""
        return self._submit_payload(
            data=sub_account_data,
            url="/br-reg/rest/account-manager/doSubmit",
            payload_model=SubAccountPayload,
            error_message="Invalid sub account payload",
        )
