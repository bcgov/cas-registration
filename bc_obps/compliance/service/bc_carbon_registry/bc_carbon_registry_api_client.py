import requests
import logging
from django.utils import timezone
from typing import Dict, Optional, Type, Any, Union, Literal
from datetime import datetime, timedelta
from django.conf import settings
from pydantic import BaseModel, ValidationError
from compliance.service.bc_carbon_registry.exceptions import BCCarbonRegistryError
from compliance.service.bc_carbon_registry.schema import (
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
    IssuancePayload,
    SubAccountPayload,
    SearchFilterWrapper,
)
from requests.exceptions import Timeout, ConnectionError, HTTPError, RequestException
from compliance.service.bc_carbon_registry.utils import log_error_message


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
    COMPLIANCE_ACCOUNT_TYPE_ID = 14

    # API Endpoints
    AUTH_ENDPOINT = "/user-api/okta/token"
    ACCOUNT_SEARCH_ENDPOINT = "/raas-report-api/es/account/pagePrivateSearchByFilter"
    UNIT_SEARCH_ENDPOINT = "/raas-report-api/es/unit/pagePrivateSearchByFilter"
    PROJECT_DETAILS_ENDPOINT = "/raas-project-api/project-manager/getById"
    PROJECT_SUBMIT_ENDPOINT = "/raas-project-api/project-manager/doSubmit"
    TRANSFER_SUBMIT_ENDPOINT = "/raas-credit-api/transfer-manager/doSubmit"
    ISSUANCE_SUBMIT_ENDPOINT = "/br-reg/rest/market-issuance-manager/doSubmit"
    ACCOUNT_SUBMIT_ENDPOINT = "/br-reg/rest/account-manager/doSubmit"

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
        url = f"{self.api_url}{self.AUTH_ENDPOINT}"

        try:
            response = requests.post(
                url, json={"clientId": self.client_id, "clientSecret": self.client_secret}, timeout=(3, 7)
            )  # 3s connect, 7s read
            response.raise_for_status()
            data = TokenResponse(**response.json())
            self.token = data.access_token
            self.token_expiry = timezone.now() + timedelta(seconds=data.expires_in)
        except Timeout as e:
            logger.error("Authentication timed out: %s", str(e), exc_info=True)
            raise BCCarbonRegistryError(f"Request timed out: {str(e)}", endpoint=url) from e
        except ConnectionError as e:
            logger.error("Authentication failed due to connection error: %s", str(e), exc_info=True)
            raise BCCarbonRegistryError(f"Connection error: {str(e)}", endpoint=url) from e
        except HTTPError as e:
            response_text = (
                getattr(e.response, 'text', 'No response text available')
                if hasattr(e, 'response')
                else 'No response available'
            )
            logger.error(
                "Authentication failed with HTTP error: %s, response: %s", str(e), response_text, exc_info=True
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
        if token is None or token_expiry is None or timezone.now() >= token_expiry:
            logger.warning("Token missing or expired. Re-authenticating...")
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
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        url = f"{self.api_url}{endpoint}"

        # exclude_none=True to remove None values (Cause issues when sending None values when filtering)
        data_dict = data.model_dump(exclude_none=True) if data else None
        try:
            response = requests.request(method=method, url=url, headers=headers, json=data_dict, params=params)
            response.raise_for_status()
            response_json = response.json()
            if response_model:
                validated_response = response_model(**response_json).model_dump()
            else:
                validated_response = response_json
            return validated_response
        except ValidationError as e:
            logger.error("Invalid response from %s: %s", url, str(e), exc_info=True)
            raise BCCarbonRegistryError(f"Invalid response format: {str(e)}", endpoint=url) from e
        except Exception as e:
            log_error_message(e)  # If BCCR API returns a valid error response, this will log it
            logger.error("Request to %s failed: %s", url, str(e), exc_info=True)
            raise BCCarbonRegistryError(f"Request failed: {str(e)}", endpoint=url) from e

    def _submit_payload(
        self,
        data: Dict,
        url: str,
        payload_model: Type[Any],
        method: Literal["POST", "PUT", "PATCH"] = "POST",
        response_model: Optional[type[BaseModel]] = None,
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
        return self._make_request(method, url, data=payload, response_model=response_model)

    @staticmethod
    def _check_pagination_params(limit: int, start: int) -> None:
        """
        Check if pagination parameters are valid.
        :param limit: Number of items to retrieve.
        :param start: Starting index for pagination.
        :raises ValueError: If pagination parameters are invalid
        """
        if limit < 1 or start < 0:
            logger.error("Invalid pagination parameters: limit=%s, start=%s", limit, start)
            raise ValueError("limit must be positive and start non-negative")

    def get_account_details(self, account_id: Union[str, int]) -> Dict:
        """
        Retrieves account details for the given account ID. This endpoint works for both compliance and holding accounts.
        :param account_id: The ID of the account to retrieve.
        """
        if isinstance(account_id, str) and not account_id.isdigit():
            logger.error("Invalid account_id: %s", account_id)
            raise ValueError("account_id must be a numeric string")

        payload = SearchFilterWrapper(
            searchFilter=SearchFilter(
                filterModel=FilterModel(
                    accountId={"columnFilters": [ColumnFilter(filterType="Number", type="equals", filter=account_id)]}
                ),
            )
        )
        return self._make_request(
            "POST", self.ACCOUNT_SEARCH_ENDPOINT, data=payload, response_model=AccountDetailsResponse
        )

    def list_all_accounts(self, limit: int = 20, start: int = 0) -> Dict:
        """
        List all accounts.
        :param limit: Number of accounts to retrieve.
        :param start: Starting index for pagination.
        NOTE: We can extend filterModel to filter by different options in the future. (e.g. accountTypeId, entityId, etc.)
        """
        self._check_pagination_params(limit, start)

        payload = SearchFilterWrapper(searchFilter=SearchFilter(pagination=Pagination(start=start, limit=limit)))
        return self._make_request(
            "POST", self.ACCOUNT_SEARCH_ENDPOINT, data=payload, response_model=AccountDetailsResponse
        )

    def list_all_units(
        self, account_id: Union[str, int], limit: int = 20, start: int = 0, state_filter: str = "ACTIVE"
    ) -> Dict:
        """
        List compliance units for a given holding account.
        We need to list the units that are ACTIVE and issued in the last 3 years.(Using vintage filter)

        Args:
            account_id: The ID of the account
            limit: Maximum number of units to return
            start: Starting index for pagination
            state_filter: State filter for units. Can be single state like "ACTIVE"
                         or multiple states like "ACTIVE,RETIRED"
        """
        self._check_pagination_params(limit, start)

        if isinstance(account_id, str) and not account_id.isdigit():
            logger.error("Invalid account_id: %s", account_id)
            raise ValueError("account_id must be a numeric string")

        # Determine filter type based on whether we have multiple states
        filter_type: Literal["in", "equals"] = "in" if "," in state_filter else "equals"

        payload = SearchFilterWrapper(
            searchFilter=SearchFilter(
                pagination=Pagination(start=start, limit=limit),
                filterModel=FilterModel(
                    accountId={"columnFilters": [ColumnFilter(filterType="Number", type="equals", filter=account_id)]},
                    stateCode={
                        "columnFilters": [ColumnFilter(filterType="Text", type=filter_type, filter=state_filter)]
                    },
                    vintage={
                        "columnFilters": [
                            ColumnFilter(filterType="Number", type="greaterThanOrEqual", filter=timezone.now().year - 3)
                        ]
                    },
                ),
            )
        )
        return self._make_request(
            "POST",
            self.UNIT_SEARCH_ENDPOINT,
            data=payload,
            response_model=UnitDetailsResponse,
        )

    def get_project_details(self, project_id: Union[str, int]) -> Dict:
        if isinstance(project_id, str) and not project_id.isdigit():
            logger.error("Invalid project_id: %s", project_id)
            raise ValueError("project_id must be a numeric string")
        url = f"{self.PROJECT_DETAILS_ENDPOINT}/{project_id}"
        return self._make_request("GET", url, response_model=ProjectDetailsResponse)

    def create_project(self, project_data: Dict) -> Dict:
        """
        Example payload: (default values not included)
        {
            'account_id': '103100000028641',
            'project_name': 'Test BC Project - Billie Blue 10',
            'project_description': 'Test Description - Billie Blue 10',
            'mixedUnitList': [
                {
                   'city': 'Vancouver',
                   'address_line_1': 'Test - Billie Blue 10',
                   'zipcode': 'H0H0H0',
                   'province': 'BC',
                   'period_start_date': '2025-03-01',
                   'period_end_date': '2025-03-31',
                   'latitude': 49.2827,
                   'longitude': -123.1207,
                }
            ],
        }
        """
        return self._submit_payload(
            data=project_data,
            url=self.PROJECT_SUBMIT_ENDPOINT,
            payload_model=ProjectPayload,
            response_model=ProjectDetailsResponse,
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

        Example payload: (default values not included)
        {
            "destination_account_id": "103100000028649",
            "mixedUnitList": [
                {
                    "account_id": "103100000028641",
                    "serial_no": "BC-BCO-IN-104100000030260-01012039-31122039-21887521-21888518-SPG",
                    "new_quantity": 1,
                    "id": "103200000392472",
                }
            ]
        }
        """
        return self._submit_payload(
            data=transfer_data,
            url=self.TRANSFER_SUBMIT_ENDPOINT,
            payload_model=TransferPayload,
            error_message="Invalid transfer payload",
        )

    def create_issuance(self, issuance_data: Dict) -> Dict:
        """
        Create an issuance.
        An issuance record is created in Draft status along with units are created with the holding_quantity mentioned in payload in NEW status.

        Example payload: (default values not included)
        {
            "account_id": "103100000028641",
            "issuance_requested_date": "2025-05-01T13:13:28.547Z",
            "project_id": "104100000030325",
            "verifications": [
                {
                    "verificationStartDate": "01/01/2025",
                    "verificationEndDate": "31/01/2025",
                    "monitoringPeriod": "01/01/2025 - 31/01/2025",
                    "mixedUnits": [
                        {
                            "holding_quantity": 5,
                            "vintage_start": "2025-01-01T00:00:00Z",
                            "vintage_end": "2025-01-31T00:00:00Z",
                            "city": "Vancouver",
                            "address_line_1": "Test - Billie Blue 3",
                            "zipcode": "H0H0H0",
                            "latitude": 49.2827,
                            "longitude": -123.1207,
                            "defined_unit_id": "103200000392481",
                            "project_type_id": "140000000000002"
                        }
                    ]
                }
            ]
        }
        """
        return self._submit_payload(
            data=issuance_data,
            url=self.ISSUANCE_SUBMIT_ENDPOINT,
            payload_model=IssuancePayload,
            error_message="Invalid issuance payload",
        )

    def create_sub_account(self, sub_account_data: Dict) -> Dict:
        """
        Create a subaccount for holding account

        Example payload: (default values not included)
        {
            "master_account_id": "103100000028641",
            "compliance_year": 2025,
            "organization_classification_id": "100000000000096",
            "type_of_organization": "140000000000002", We can get this from account details (type_of_account_holder) and then map it to the below list
            "boro_id": "25-0004",
            "registered_name": "Test Billie Blue Subaccount 2 May 1 - operation name",
        }

        Account Holder Type
        ------------------
        140000000000001		    Individual
        140000000000002 		Corporation
        140000000000003 		Partnership
        """
        return self._submit_payload(
            data=sub_account_data,
            url=self.ACCOUNT_SUBMIT_ENDPOINT,
            payload_model=SubAccountPayload,
            error_message="Invalid sub account payload",
        )

    def get_compliance_account(self, master_account_id: Union[str, int], compliance_year: int, boro_id: str) -> Dict:
        """
        Get compliance account(Sub Account) filtered by master account ID, compliance year, and BORO ID.

        :param master_account_id: The ID of the master account
        :param compliance_year: The compliance year to filter by
        :param boro_id: The BORO ID to filter by
        :return: Dictionary containing the search results

        Account Types - ID:
        Project Proponent - 2
        Validator/Verifier - 6
        Program Administrator - 7
        General Participant - 10
        Operator of Regulated Operation - 11
        Compliance - 14
        """
        if isinstance(master_account_id, str) and not master_account_id.isdigit():
            logger.error("Invalid master_account_id: %s", master_account_id)
            raise ValueError("master_account_id must be a numeric string")

        payload = SearchFilterWrapper(
            searchFilter=SearchFilter(
                filterModel=FilterModel(
                    accountTypeId={
                        "columnFilters": [
                            ColumnFilter(filterType="Number", type="equals", filter=self.COMPLIANCE_ACCOUNT_TYPE_ID)
                        ]
                    },
                    masterAccountId={
                        "columnFilters": [ColumnFilter(filterType="Number", type="equals", filter=master_account_id)]
                    },
                    stateCode={"columnFilters": [ColumnFilter(filterType="Text", type="equals", filter="ACTIVE")]},
                    complianceYear={
                        "columnFilters": [ColumnFilter(filterType="Number", type="equals", filter=compliance_year)]
                    },
                    boroId={"columnFilters": [ColumnFilter(filterType="Text", type="equals", filter=boro_id)]},
                ),
            )
        )
        return self._make_request(
            "POST", self.ACCOUNT_SEARCH_ENDPOINT, data=payload, response_model=AccountDetailsResponse
        )
