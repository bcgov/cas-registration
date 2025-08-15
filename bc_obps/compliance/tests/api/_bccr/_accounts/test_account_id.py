from unittest.mock import patch
from django.test import SimpleTestCase, override_settings, Client
from compliance.service.bc_carbon_registry.exceptions import BCCarbonRegistryError
from registration.utils import custom_reverse_lazy
from compliance.dataclass import BCCRAccountResponseDetails

# Constants
VALID_ACCOUNT_ID = "123456789012345"
COMPLIANCE_REPORT_VERSION_ID = 1
BCCR_SERVICE_PATH = (
    "compliance.service.bc_carbon_registry.account_service.BCCarbonRegistryAccountService.get_account_details"
)
VALIDATE_PERMISSION_PATH = 'common.permissions.validate_all'


@override_settings(MIDDLEWARE=[])  # Disable middleware to prevent database queries
class TestAccountIdEndpoint(SimpleTestCase):  # Use SimpleTestCase to avoid database access
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.client = Client()

    @staticmethod
    def _get_endpoint_url(account_id, compliance_report_version_id):
        return custom_reverse_lazy(
            "get_bccr_account_details",
            kwargs={"account_id": account_id, "compliance_report_version_id": compliance_report_version_id},
        )

    @patch(BCCR_SERVICE_PATH)
    @patch(VALIDATE_PERMISSION_PATH)
    def test_successful_account_details_retrieval(self, mock_permission, mock_service):
        # Arrange
        mock_permission.return_value = True
        mock_service.return_value = BCCRAccountResponseDetails(
            entity_id="123",
            organization_classification_id="456",
            type_of_account_holder="Corporation",
            trading_name="Test Account Inc.",
        )
        # Act
        response = self.client.get(self._get_endpoint_url(VALID_ACCOUNT_ID, COMPLIANCE_REPORT_VERSION_ID))
        # Assert
        mock_service.assert_called_once_with(account_id=VALID_ACCOUNT_ID)
        assert response.status_code == 200
        assert response.json() == {"bccr_trading_name": "Test Account Inc."}

    @patch(VALIDATE_PERMISSION_PATH)
    def test_invalid_account_id_format(self, mock_permission):
        # Arrange
        mock_permission.return_value = True
        # Act
        response = self.client.get(self._get_endpoint_url("12345", COMPLIANCE_REPORT_VERSION_ID))
        # Assert
        assert response.status_code == 422
        assert "Account Id: String should match pattern" in response.json().get("message")

    @patch(BCCR_SERVICE_PATH)
    @patch(VALIDATE_PERMISSION_PATH)
    def test_empty_account_details_response(self, mock_permission, mock_service):
        # Arrange
        mock_permission.return_value = True
        mock_service.return_value = None
        # Act
        response = self.client.get(self._get_endpoint_url(VALID_ACCOUNT_ID, COMPLIANCE_REPORT_VERSION_ID))
        # Assert
        assert response.status_code == 200
        assert response.json() == {"bccr_trading_name": None}

    @patch(BCCR_SERVICE_PATH)
    @patch(VALIDATE_PERMISSION_PATH)
    def test_service_error_handling(self, mock_permission, mock_service):
        # Arrange
        mock_permission.return_value = True
        mock_service.side_effect = BCCarbonRegistryError("Service error")
        # Act
        response = self.client.get(self._get_endpoint_url(VALID_ACCOUNT_ID, COMPLIANCE_REPORT_VERSION_ID))
        # Assert
        assert response.status_code == 400
        assert response.json() == {
            "message": "The system cannot connect to the external application. Please try again later. If the problem persists, contact GHGRegulator@gov.bc.ca for help."
        }
