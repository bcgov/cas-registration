from unittest.mock import patch
from django.test import SimpleTestCase, override_settings, Client
from compliance.service.bc_carbon_registry.exceptions import BCCarbonRegistryError
from registration.utils import custom_reverse_lazy

# Constants
VALID_ACCOUNT_ID = "123456789012345"
BCCR_API_PATH = (
    "compliance.service.bc_carbon_registry.bc_carbon_registry_api_client.BCCarbonRegistryAPIClient.get_account_details"
)
PERMISSION_CHECK_PATH = "common.permissions.check_permission_for_role"


@override_settings(MIDDLEWARE=[])  # Disable middleware to prevent database queries
class TestAccountIdEndpoint(SimpleTestCase):  # Use SimpleTestCase to avoid database access
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.client = Client()

    @staticmethod
    def _get_endpoint_url(account_id):
        return custom_reverse_lazy("get_bccr_account_details", kwargs={"account_id": account_id})

    @patch(BCCR_API_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_successful_account_details_retrieval(self, mock_permission, mock_api_client):
        # Arrange
        mock_permission.return_value = True
        mock_api_client.return_value = {"entities": [{"accountName": "Test Account Inc."}]}
        # Act
        response = self.client.get(self._get_endpoint_url(VALID_ACCOUNT_ID))
        # Assert
        mock_api_client.assert_called_once_with(account_id=VALID_ACCOUNT_ID)
        assert response.status_code == 200
        assert response.json() == {"tradingName": "Test Account Inc."}

    @patch(PERMISSION_CHECK_PATH)
    def test_invalid_account_id_format(self, mock_permission):
        # Arrange
        mock_permission.return_value = True
        # Act
        response = self.client.get(self._get_endpoint_url("12345"))
        # Assert
        assert response.status_code == 422
        assert "Account Id: String should match pattern" in response.json().get("message")

    @patch(BCCR_API_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_empty_entities_response(self, mock_permission, mock_api_client):
        # Arrange
        mock_permission.return_value = True
        mock_api_client.return_value = {"entities": []}
        # Act
        response = self.client.get(self._get_endpoint_url(VALID_ACCOUNT_ID))
        # Assert
        assert response.status_code == 200
        assert response.json() == {"tradingName": None}

    @patch(BCCR_API_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_api_client_error_handling(self, mock_api_client, mock_permission):
        # Arrange
        mock_permission.return_value = True
        mock_api_client.side_effect = BCCarbonRegistryError("Client error")
        # Act
        response = self.client.get(self._get_endpoint_url(VALID_ACCOUNT_ID))
        # Assert
        assert response.status_code == 400
        assert response.json() == {"message": "BC Carbon Registry features not available at this time"}
