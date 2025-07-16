import pytest
from unittest.mock import Mock
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import requests
import logging
from compliance.service.bc_carbon_registry.bc_carbon_registry_api_client import BCCarbonRegistryAPIClient
from compliance.service.bc_carbon_registry.exceptions import BCCarbonRegistryError
from compliance.service.bc_carbon_registry.schema import (
    SearchFilter,
    Pagination,
    FilterModel,
    AccountDetailsResponse,
    ProjectPayload,
)
from django.conf import settings

# Configure logging for tests
logging.basicConfig(level=logging.INFO)

# Shared constants
MOCK_FIFTEEN_DIGIT_STRING = "123456789101112"
MOCK_FIFTEEN_DIGIT_INT = 123456789101112
API_URL = "https://api.example.com"
CLIENT_ID = "test_client_id"
CLIENT_SECRET = "test_client_secret"
TOKEN = "test_token"
VALID_TOKEN_EXPIRY = datetime.now(ZoneInfo("UTC")) + timedelta(seconds=3600)

# Common mock account response
BASE_ACCOUNT_RESPONSE = {
    "totalEntities": 1,
    "totalPages": 1,
    "numberOfElements": 1,
    "first": True,
    "last": True,
    "entities": [
        {
            "id": f"{MOCK_FIFTEEN_DIGIT_STRING}_{MOCK_FIFTEEN_DIGIT_STRING}",
            "standardId": MOCK_FIFTEEN_DIGIT_STRING,
            "standardName": "Test Standard",
            "entityId": MOCK_FIFTEEN_DIGIT_STRING,
            "accountName": "Test Account",
            "accountId": MOCK_FIFTEEN_DIGIT_STRING,
            "mainContactName": "John Doe",
            "accountTypeName": "Test Account Type",
            "accountTypeId": 10,
            "type_of_account_holder": "Test Type",
        }
    ],
}


@pytest.fixture(autouse=True)
def setup(monkeypatch):
    """Set up environment variables and reset service instance for each test."""
    # Arrange
    monkeypatch.setattr(settings, "BCCR_API_URL", API_URL)
    monkeypatch.setattr(settings, "BCCR_CLIENT_ID", CLIENT_ID)
    monkeypatch.setattr(settings, "BCCR_CLIENT_SECRET", CLIENT_SECRET)
    BCCarbonRegistryAPIClient._instance = None
    client = BCCarbonRegistryAPIClient()
    yield client
    # Cleanup
    BCCarbonRegistryAPIClient._instance = None


@pytest.fixture
def authenticated_client(setup, mocker):
    """Fixture for an authenticated client with mocked requests."""
    client = setup
    client.token = TOKEN
    client.token_expiry = VALID_TOKEN_EXPIRY
    mock_request = mocker.patch("requests.request")
    return client, mock_request


@pytest.fixture
def valid_project_payload():
    return {
        "account_id": "103100000028575",
        "project_name": "Test Project",
        "project_description": "Test Description",
        "mixedUnitList": [
            {
                "city": "City",
                "address_line_1": "Line 1",
                "zipcode": "H0H0H0",
                "province": "BC",
                "period_start_date": "2025-01-01",
                "period_end_date": "2025-01-31",
            }
        ],
    }


@pytest.fixture
def valid_transfer_payload():
    return {
        "destination_account_id": "103000000036531",
        "mixedUnitList": [
            {
                "account_id": "103200000396923",
                "serial_no": "BC-BCE-IN-104000000037027-01032025-30032025-16414-16752-SPG",
                "new_quantity": 1,
                "id": "103200000396923",
                "do_action": True,
            }
        ],
    }


@pytest.fixture
def valid_issuance_payload():
    return {
        "account_id": "103100000028575",
        "issuance_requested_date": "2025-01-24T13:13:28.547Z",
        "project_id": "104000000036500",
        "unit_type_id": "140000000000001",
        "newRecord": True,
        "verifications": [
            {
                "verificationStartDate": "2025-01-01",
                "verificationEndDate": "2025-01-31",
                "monitoringPeriod": "01/01/2025 - 31/01/2025",
                "mixedUnits": [
                    {
                        "holding_quantity": 100,
                        "state_name": "NEW",
                        "vintage_start": "2025-01-01T00:00:00Z",
                        "vintage_end": "2025-01-31T00:00:00Z",
                        "city": "City",
                        "address_line_1": "Line 1",
                        "zipcode": "H0H0H0",
                        "province": "BC",
                        "defined_unit_id": "103000000392535",
                        "project_type_id": "140000000000002",
                    }
                ],
            }
        ],
    }


@pytest.fixture
def valid_sub_account_payload():
    return {
        "organization_classification_id": "100000000000097",
        "compliance_year": 2025,
        "registered_name": "Test BC Subaccount",
        "master_account_id": "103000000037199",
        "type_of_organization": "140000000000001",
        "boro_id": "12-3456",
    }


@pytest.fixture
def mock_success_response():
    return Mock(status_code=200, json=lambda: {"success": True, "result": {"id": "123"}})


def assert_account_keys(entities):
    assert sorted(list(entities[0].keys())) == sorted(
        [
            "id",
            "entityId",
            "standardId",
            "standardName",
            "accountName",
            "accountId",
            "mainContactName",
            "accountTypeName",
            "accountTypeId",
            "type_of_account_holder",
        ]
    )


class TestBCCarbonRegistryAPIClient:
    def test_singleton_pattern(self, setup):
        # Arrange
        client1 = BCCarbonRegistryAPIClient()
        client2 = BCCarbonRegistryAPIClient()
        # Act & Assert
        assert client1 is client2

    def test_initialization(self, setup):
        # Arrange
        client = setup
        # Act & Assert
        assert client.api_url == API_URL
        assert not client.api_url.endswith("/")
        assert client.client_id == CLIENT_ID
        assert client.client_secret == CLIENT_SECRET
        assert getattr(client, "token", None) is None
        assert getattr(client, "token_expiry", None) is None

    def test_validate_config_missing_url(self, monkeypatch):
        # Arrange
        monkeypatch.setattr(settings, "BCCR_API_URL", None)
        BCCarbonRegistryAPIClient._instance = None
        client = BCCarbonRegistryAPIClient()
        # Act & Assert
        with pytest.raises(BCCarbonRegistryError, match="missing configuration"):
            client._validate_config()

    def test_authenticate_success(self, setup, mocker, caplog):
        # Arrange
        client = setup
        mock_post = mocker.patch("requests.post")
        mock_response = Mock(
            status_code=200,
            json=lambda: {
                "access_token": TOKEN,
                "expires_in": 3600,
                "token_type": "Bearer",
            },
        )
        mock_post.return_value = mock_response
        # Act
        client._authenticate()
        # Assert
        assert client.token == TOKEN
        assert isinstance(client.token_expiry, datetime)
        assert client.token_expiry > datetime.now(ZoneInfo("UTC"))
        mock_post.assert_called_once_with(
            f"{API_URL}/user-api/okta/token",
            json={"clientId": CLIENT_ID, "clientSecret": CLIENT_SECRET},
            timeout=(3, 7),
        )

    def test_authenticate_timeout(self, setup, mocker, caplog):
        # Arrange
        client = setup
        mocker.patch("requests.post", side_effect=requests.Timeout("Connection timed out"))
        # Act & Assert
        with caplog.at_level(logging.ERROR):
            with pytest.raises(BCCarbonRegistryError, match="Request timed out"):
                client._authenticate()
            assert "Authentication timed out" in caplog.text

    def test_authenticate_connection_error(self, setup, mocker, caplog):
        # Arrange
        client = setup
        mocker.patch("requests.post", side_effect=requests.ConnectionError("Connection refused"))
        # Act & Assert
        with caplog.at_level(logging.ERROR):
            with pytest.raises(BCCarbonRegistryError, match="Connection error"):
                client._authenticate()
            assert "Authentication failed due to connection error" in caplog.text

    def test_authenticate_http_error(self, setup, mocker, caplog):
        # Arrange
        client = setup
        mock_response = Mock(status_code=401, text="Unauthorized")
        mock_response.raise_for_status.side_effect = requests.HTTPError("401 Client Error")
        mocker.patch("requests.post", return_value=mock_response)
        # Act & Assert
        with caplog.at_level(logging.ERROR):
            with pytest.raises(BCCarbonRegistryError, match="HTTP error"):
                client._authenticate()
            assert "Authentication failed with HTTP error" in caplog.text

    def test_authenticate_validation_error(self, setup, mocker, caplog):
        # Arrange
        client = setup
        mocker.patch("requests.post", return_value=Mock(status_code=200, json=lambda: {"invalid_field": "value"}))
        # Act & Assert
        with caplog.at_level(logging.ERROR):
            with pytest.raises(BCCarbonRegistryError, match="Invalid token response"):
                client._authenticate()
            assert "Authentication failed" in caplog.text

    def test_ensure_authenticated_valid_token(self, setup):
        """Test that ensure_authenticated does not re-authenticate with a valid token."""
        # Arrange
        client = setup
        client.token = TOKEN
        client.token_expiry = VALID_TOKEN_EXPIRY
        # Act
        client._ensure_authenticated()
        # Assert
        assert client.token == TOKEN

    def test_ensure_authenticated_expired_token(self, setup, mocker, caplog):
        """Test re-authentication when token is expired."""
        # Arrange
        client = setup
        client.token = "old_token"
        client.token_expiry = datetime.now(ZoneInfo("UTC")) - timedelta(seconds=3600)
        mock_post = mocker.patch("requests.post")
        mock_post.return_value = Mock(
            status_code=200,
            json=lambda: {
                "access_token": "new_token",
                "expires_in": 3600,
                "token_type": "Bearer",
            },
        )
        # Act
        with caplog.at_level(logging.WARNING):
            client._ensure_authenticated()
            assert "Token missing or expired" in caplog.text
        # Assert
        assert client.token == "new_token"

    def test_make_request_success(self, authenticated_client, mock_success_response):
        # Arrange
        client, mock_request = authenticated_client
        mock_request.return_value = mock_success_response
        payload = SearchFilter(pagination=Pagination(), filterModel=FilterModel())
        # Act
        result = client._make_request(method="POST", endpoint="/test", data=payload)
        # Assert
        assert result == {"success": True, "result": {"id": "123"}}
        mock_request.assert_called_once_with(
            method="POST",
            url=f"{API_URL}/test",
            headers={
                "Authorization": f"Bearer {TOKEN}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json=payload.model_dump(exclude_none=True),
            params=None,
        )

    def test_make_request_invalid_response_validation(self, authenticated_client):
        # Arrange
        client, mock_request = authenticated_client
        mock_response = Mock(
            status_code=200,
            json=lambda: {"invalid_field": "value"},  # Invalid schema for response_model
        )
        mock_request.return_value = mock_response
        payload = SearchFilter(pagination=Pagination(), filterModel=FilterModel())

        # Act & Assert
        with pytest.raises(BCCarbonRegistryError, match="Invalid response format"):
            client._make_request(
                method="POST",
                endpoint="/test",
                data=payload,
                response_model=AccountDetailsResponse,  # Expecting AccountDetailsResponse schema
            )

    def test_make_request_non_200_status(self, authenticated_client, caplog):
        # Arrange
        client, mock_request = authenticated_client
        mock_response = Mock(status_code=400, text="Bad Request")
        mock_response.raise_for_status.side_effect = requests.HTTPError("400 Bad Request")
        mock_request.return_value = mock_response

        # Act & Assert
        with caplog.at_level(logging.ERROR):
            with pytest.raises(BCCarbonRegistryError, match="Request failed"):
                client._make_request(method="GET", endpoint="/test")
            assert "Request to" in caplog.text

    def test_check_pagination_params_invalid(self, setup, caplog):
        # Arrange
        client = setup

        # Act & Assert
        with caplog.at_level(logging.ERROR):
            with pytest.raises(ValueError, match="limit must be positive and start non-negative"):
                client._check_pagination_params(limit=0, start=0)
            with pytest.raises(ValueError, match="limit must be positive and start non-negative"):
                client._check_pagination_params(limit=10, start=-1)
            assert "Invalid pagination parameters" in caplog.text

    def test_submit_payload_empty(self, setup):
        # Arrange
        client = setup
        empty_payload = {}

        # Act & Assert
        with pytest.raises(BCCarbonRegistryError, match="Invalid payload"):
            client._submit_payload(
                data=empty_payload, url="/test", payload_model=ProjectPayload, error_message="Invalid payload"
            )

    def test_get_account_details_success(self, authenticated_client):
        # Arrange
        client, mock_request = authenticated_client
        mock_request.return_value = Mock(status_code=200, json=lambda: BASE_ACCOUNT_RESPONSE)
        # Act
        result = client.get_account_details(MOCK_FIFTEEN_DIGIT_STRING)
        # Assert
        assert result["totalEntities"] == 1
        assert len(result["entities"]) == 1
        assert_account_keys(result["entities"])
        mock_request.assert_called_once()

    def test_get_account_details_invalid_id(self, setup, caplog):
        # Arrange
        client = setup
        # Act & Assert
        with caplog.at_level(logging.ERROR):
            with pytest.raises(ValueError, match="account_id must be a numeric string"):
                client.get_account_details("invalid")
            assert "Invalid account_id" in caplog.text

    def test_list_all_accounts_success(self, authenticated_client):
        # Arrange
        client, mock_request = authenticated_client
        mock_response = Mock(
            status_code=200,
            json=lambda: {
                "totalEntities": 2,
                "totalPages": 1,
                "numberOfElements": 2,
                "first": True,
                "last": True,
                "entities": [
                    BASE_ACCOUNT_RESPONSE["entities"][0],
                    {
                        "id": f"{MOCK_FIFTEEN_DIGIT_STRING}_{MOCK_FIFTEEN_DIGIT_STRING}_2",
                        "standardId": MOCK_FIFTEEN_DIGIT_STRING,
                        "standardName": "Test Standard 2",
                        "entityId": MOCK_FIFTEEN_DIGIT_STRING,
                        "accountName": "Test Account 2",
                        "accountId": MOCK_FIFTEEN_DIGIT_STRING,
                        "mainContactName": "Jane Doe",
                        "accountTypeName": "Test Account Type 2",
                        "accountTypeId": 20,
                        "type_of_account_holder": "Test Type 2",
                    },
                ],
            },
        )
        mock_request.return_value = mock_response
        # Act
        result = client.list_all_accounts(limit=10, start=0)
        # Assert
        assert result["totalEntities"] == 2
        assert len(result["entities"]) == 2
        assert_account_keys(result["entities"])
        mock_request.assert_called_once()

    def test_get_account_details_non_existent(self, authenticated_client):
        # Arrange
        client, mock_request = authenticated_client
        mock_response = Mock(
            status_code=200,
            json=lambda: {
                "totalEntities": 0,
                "totalPages": 0,
                "numberOfElements": 0,
                "first": True,
                "last": True,
                "entities": [],
            },
        )
        mock_request.return_value = mock_response

        # Act
        result = client.get_account_details(MOCK_FIFTEEN_DIGIT_STRING)

        # Assert
        assert result["totalEntities"] == 0
        assert len(result["entities"]) == 0
        mock_request.assert_called_once()

    def test_list_all_accounts_empty_result(self, authenticated_client):
        # Arrange
        client, mock_request = authenticated_client
        mock_response = Mock(
            status_code=200,
            json=lambda: {
                "totalEntities": 0,
                "totalPages": 0,
                "numberOfElements": 0,
                "first": True,
                "last": True,
                "entities": [],
            },
        )
        mock_request.return_value = mock_response
        # Act
        result = client.list_all_accounts(limit=10, start=0)
        # Assert
        assert result["totalEntities"] == 0
        assert len(result["entities"]) == 0
        mock_request.assert_called_once()

    def test_list_all_units_success(self, authenticated_client):
        # Arrange
        client, mock_request = authenticated_client
        mock_response = Mock(
            status_code=200,
            json=lambda: {
                "totalEntities": 1,
                "totalPages": 1,
                "numberOfElements": 1,
                "first": True,
                "last": True,
                "entities": [
                    {
                        "id": MOCK_FIFTEEN_DIGIT_STRING,
                        "entityId": MOCK_FIFTEEN_DIGIT_INT,
                        "standardId": MOCK_FIFTEEN_DIGIT_INT,
                        "standardName": "Test Standard",
                        "accountId": MOCK_FIFTEEN_DIGIT_INT,
                        "accountName": "Test Account",
                        "projectId": MOCK_FIFTEEN_DIGIT_INT,
                        "holdingQuantity": 2.0,
                        "serialNo": "BC-BCE-IN-104000000037027-01032025-30032025-16414-16752-SPG",
                        "unitMeasurementName": "tCO2e",
                        "unitType": "BCO",
                        "className": "BCO",
                    }
                ],
            },
        )
        mock_request.return_value = mock_response
        # Act
        result = client.list_all_units(account_id="123", limit=10, start=0)
        # Assert
        assert result["totalEntities"] == 1
        assert len(result["entities"]) == 1
        assert sorted(list(result["entities"][0].keys())) == sorted(
            [
                "id",
                "entityId",
                "standardId",
                "standardName",
                "accountId",
                "accountName",
                "projectId",
                "holdingQuantity",
                "serialNo",
                "unitMeasurementName",
                "unitType",
                "className",
            ]
        )
        mock_request.assert_called_once()

    def test_list_all_units_invalid_params(self, setup, caplog):
        # Arrange
        client = setup
        # Act & Assert
        with caplog.at_level(logging.ERROR):
            with pytest.raises(ValueError, match="account_id must be a numeric string"):
                client.list_all_units(account_id="invalid")
            assert "Invalid account_id" in caplog.text

    def test_list_all_units_no_units_in_vintage(self, authenticated_client):
        # Arrange
        client, mock_request = authenticated_client
        mock_response = Mock(
            status_code=200,
            json=lambda: {
                "totalEntities": 0,
                "totalPages": 0,
                "numberOfElements": 0,
                "first": True,
                "last": True,
                "entities": [],
            },
        )
        mock_request.return_value = mock_response

        # Act
        result = client.list_all_units(account_id="123", limit=10, start=0)

        # Assert
        assert result["totalEntities"] == 0
        assert len(result["entities"]) == 0
        mock_request.assert_called_once()

    def test_get_project_details_success(self, authenticated_client):
        # Arrange
        client, mock_request = authenticated_client
        mock_response = Mock(
            status_code=200,
            json=lambda: {
                "id": MOCK_FIFTEEN_DIGIT_INT,
                "account_id": MOCK_FIFTEEN_DIGIT_INT,
                "project_name": "Test Project",
                "project_description": "Test Description",
            },
        )
        mock_request.return_value = mock_response
        # Act
        result = client.get_project_details(project_id="456")
        # Assert
        assert result["id"] == MOCK_FIFTEEN_DIGIT_INT
        assert result["account_id"] == MOCK_FIFTEEN_DIGIT_INT
        assert result["project_name"] == "Test Project"
        assert result["project_description"] == "Test Description"
        mock_request.assert_called_once_with(
            method="GET",
            url=f"{API_URL}/raas-project-api/project-manager/getById/456",
            headers=mock_request.call_args.kwargs["headers"],
            json=None,
            params=None,
        )

    def test_get_project_details_invalid_id(self, setup, caplog):
        # Arrange
        client = setup
        # Act & Assert
        with caplog.at_level(logging.ERROR):
            with pytest.raises(ValueError, match="project_id must be a numeric string"):
                client.get_project_details(project_id="invalid")
            assert "Invalid project_id" in caplog.text

    def test_create_project_success(self, authenticated_client, valid_project_payload):
        # Arrange
        client, mock_request = authenticated_client
        mock_request.return_value = Mock(
            status_code=200,
            json=lambda: {
                "id": 103000000392508,
                "account_id": 103100000028575,
                "project_name": "Test Project",
                "project_description": "Test Description",
            },
        )
        # Act
        result = client.create_project(valid_project_payload)
        # Assert
        assert result["id"] == 103000000392508
        assert result["account_id"] == 103100000028575
        assert result["project_name"] == "Test Project"
        assert result["project_description"] == "Test Description"
        mock_request.assert_called_once()

    def test_create_project_invalid_payload(self, setup, valid_project_payload):
        # Arrange
        client = setup
        invalid_payload = valid_project_payload.copy()
        invalid_payload.pop("project_name")
        # Act & Assert
        with pytest.raises(BCCarbonRegistryError, match="Invalid project payload"):
            client.create_project(invalid_payload)

    def test_create_project_empty_mixed_unit_list(self, setup, valid_project_payload):
        # Arrange
        client = setup
        invalid_payload = valid_project_payload.copy()
        invalid_payload["mixedUnitList"] = [{"invalid_field": "value"}]
        # Act & Assert
        with pytest.raises(BCCarbonRegistryError, match="Invalid project payload"):
            client.create_project(invalid_payload)

    def test_transfer_compliance_units_success(self, authenticated_client, valid_transfer_payload):
        # Arrange
        client, mock_request = authenticated_client
        mock_response = Mock(status_code=200, json=lambda: {"success": True, "result": {"transfer_id": "456"}})
        mock_request.return_value = mock_response
        # Act
        result = client.transfer_compliance_units(valid_transfer_payload)
        # Assert
        assert result["success"] is True
        assert result["result"]["transfer_id"] == "456"
        mock_request.assert_called_once()

    def test_transfer_compliance_units_invalid_quantity(self, setup, valid_transfer_payload):
        # Arrange
        client = setup
        invalid_payload = valid_transfer_payload.copy()
        invalid_payload["mixedUnitList"][0]["new_quantity"] = 0
        # Act & Assert
        with pytest.raises(BCCarbonRegistryError, match="Invalid transfer payload"):
            client.transfer_compliance_units(invalid_payload)

    def test_create_issuance_success(self, authenticated_client, valid_issuance_payload):
        # Arrange
        client, mock_request = authenticated_client
        mock_response = Mock(status_code=200, json=lambda: {"success": True, "result": {"issuance_id": "101"}})
        mock_request.return_value = mock_response
        # Act
        result = client.create_issuance(valid_issuance_payload)
        # Assert
        assert result["success"] is True
        assert result["result"]["issuance_id"] == "101"
        mock_request.assert_called_once()

    def test_create_issuance_invalid_verification(self, setup, valid_issuance_payload):
        # Arrange
        client = setup
        invalid_payload = valid_issuance_payload.copy()
        invalid_payload["verifications"][0]["verificationStartDate"] = "invalid_date"
        # Act & Assert
        with pytest.raises(BCCarbonRegistryError, match="Invalid issuance payload"):
            client.create_issuance(invalid_payload)

    def test_create_sub_account_success(self, authenticated_client, valid_sub_account_payload):
        # Arrange
        client, mock_request = authenticated_client
        mock_response = Mock(status_code=200, json=lambda: {"success": True, "result": {"account_id": "789"}})
        mock_request.return_value = mock_response
        # Act
        result = client.create_sub_account(valid_sub_account_payload)
        # Assert
        assert result["success"] is True
        assert result["result"]["account_id"] == "789"
        mock_request.assert_called_once()

    def test_create_sub_account_missing_field(self, setup, valid_sub_account_payload):
        # Arrange
        client = setup
        invalid_payload = valid_sub_account_payload.copy()
        invalid_payload.pop("registered_name")
        # Act & Assert
        with pytest.raises(BCCarbonRegistryError, match="Invalid sub account payload"):
            client.create_sub_account(invalid_payload)

    def test_get_compliance_account_success(self, authenticated_client):
        # Arrange
        client, mock_request = authenticated_client
        mock_response = Mock(
            status_code=200,
            json=lambda: {
                **BASE_ACCOUNT_RESPONSE,
                "entities": [
                    {
                        **BASE_ACCOUNT_RESPONSE["entities"][0],
                        "masterAccountId": MOCK_FIFTEEN_DIGIT_STRING,
                        "masterAccountName": "Test Holding Account",
                        "entityId": 123456789012345,
                    }
                ],
            },
        )
        mock_request.return_value = mock_response
        # Act
        result = client.get_compliance_account(
            master_account_id=MOCK_FIFTEEN_DIGIT_STRING, compliance_year=2024, boro_id="TEST123"
        )
        # Assert
        assert result["totalEntities"] == 1
        assert len(result["entities"]) == 1
        assert result["entities"][0]["masterAccountId"] == MOCK_FIFTEEN_DIGIT_STRING
        assert result["entities"][0]["masterAccountName"] == "Test Holding Account"
        assert result["entities"][0]["entityId"] == 123456789012345
        mock_request.assert_called_once_with(
            method="POST",
            url=f"{API_URL}/raas-report-api/es/account/pagePrivateSearchByFilter",
            headers={
                "Authorization": f"Bearer {TOKEN}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json={
                "searchFilter": {
                    "pagination": {
                        "start": 0,
                        "limit": 20,
                        "sortOptions": [{"sort": "accountName.keyword", "dir": "ASC"}],
                    },
                    "filterModel": {
                        "masterAccountId": {
                            "columnFilters": [
                                {"filterType": "Number", "type": "equals", "filter": MOCK_FIFTEEN_DIGIT_STRING}
                            ]
                        },
                        "accountTypeId": {"columnFilters": [{"filterType": "Number", "type": "equals", "filter": 14}]},
                        "stateCode": {"columnFilters": [{"filterType": "Text", "type": "equals", "filter": "ACTIVE"}]},
                        "complianceYear": {
                            "columnFilters": [{"filterType": "Number", "type": "equals", "filter": 2024}]
                        },
                        "boroId": {"columnFilters": [{"filterType": "Text", "type": "equals", "filter": "TEST123"}]},
                    },
                    "groupKeys": [],
                }
            },
            params=None,
        )

    def test_get_compliance_account_invalid_id(self, setup, caplog):
        # Arrange
        client = setup
        # Act & Assert
        with caplog.at_level(logging.ERROR):
            with pytest.raises(ValueError, match="master_account_id must be a numeric string"):
                client.get_compliance_account(master_account_id="invalid", compliance_year=2024, boro_id="TEST123")
            assert "Invalid master_account_id" in caplog.text
