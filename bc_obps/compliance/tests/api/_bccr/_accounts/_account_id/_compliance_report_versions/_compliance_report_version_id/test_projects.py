from unittest.mock import patch
from django.test import SimpleTestCase, override_settings, Client
from registration.utils import custom_reverse_lazy
from compliance.service.bc_carbon_registry.exceptions import BCCarbonRegistryError

# Constants
VALID_ACCOUNT_ID = "123456789012345"
VALID_COMPLIANCE_REPORT_VERSION_ID = 1
PROJECT_SERVICE_PATH = "compliance.service.bc_carbon_registry.project_service.BCCarbonRegistryProjectService.create_project"
PERMISSION_CHECK_PATH = "common.permissions.check_permission_for_role"


@override_settings(MIDDLEWARE=[])  # Disable middleware to prevent database queries
class TestProjectsEndpoint(SimpleTestCase):  # Use SimpleTestCase to avoid database access
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.client = Client()

    @staticmethod
    def _get_endpoint_url(account_id, compliance_report_version_id):
        return custom_reverse_lazy(
            "create_bccr_project",
            kwargs={"account_id": account_id, "compliance_report_version_id": compliance_report_version_id},
        )

    @patch(PROJECT_SERVICE_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_successful_project_creation(self, mock_permission, mock_create_project):
        # Arrange
        mock_permission.return_value = True
        mock_create_project.return_value = None

        payload = {
            "bccr_holding_account_id": VALID_ACCOUNT_ID,
            "bccr_trading_name": "Test Trading Company",
        }

        # Act
        response = self.client.post(
            self._get_endpoint_url(VALID_ACCOUNT_ID, VALID_COMPLIANCE_REPORT_VERSION_ID),
            data=payload,
            content_type="application/json",
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["success"] is True

        # Verify service was called with correct parameters
        mock_create_project.assert_called_once_with(
            account_id=VALID_ACCOUNT_ID,
            compliance_report_version_id=VALID_COMPLIANCE_REPORT_VERSION_ID,
            payload=payload,
        )

    @patch(PROJECT_SERVICE_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_empty_bccr_trading_name(self, mock_permission, mock_create_project):
        # Arrange
        mock_permission.return_value = True
        mock_create_project.return_value = None
        payload = {
            "bccr_holding_account_id": VALID_ACCOUNT_ID,
            "bccr_trading_name": "",  # Empty string
        }

        # Act
        response = self.client.post(
            self._get_endpoint_url(VALID_ACCOUNT_ID, VALID_COMPLIANCE_REPORT_VERSION_ID),
            data=payload,
            content_type="application/json",
        )

        # Assert
        assert response.status_code == 422
        response_data = response.json()
        assert "Bccr Trading Name: String should have at least 1 character" in response_data.get("message", "")

    @patch(PROJECT_SERVICE_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_empty_bccr_holding_account_id(self, mock_permission, mock_create_project):
        # Arrange
        mock_permission.return_value = True
        mock_create_project.return_value = None
        payload = {
            "bccr_holding_account_id": "",  # Empty string
            "bccr_trading_name": "Test Trading Company",
        }

        # Act
        response = self.client.post(
            self._get_endpoint_url(VALID_ACCOUNT_ID, VALID_COMPLIANCE_REPORT_VERSION_ID),
            data=payload,
            content_type="application/json",
        )

        # Assert
        assert response.status_code == 422
        response_data = response.json()
        assert "Bccr Holding Account Id: String should have at least 1 character" in response_data.get("message", "")

    @patch(PROJECT_SERVICE_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_bccr_service_error_handling(self, mock_permission, mock_create_project):
        # Arrange
        mock_permission.return_value = True
        mock_create_project.side_effect = BCCarbonRegistryError("Failed to create project in BCCR")

        payload = {
            "bccr_holding_account_id": VALID_ACCOUNT_ID,
            "bccr_trading_name": "Test Trading Company",
        }

        # Act
        response = self.client.post(
            self._get_endpoint_url(VALID_ACCOUNT_ID, VALID_COMPLIANCE_REPORT_VERSION_ID),
            data=payload,
            content_type="application/json",
        )

        # Assert
        assert response.status_code == 400
        assert response.json() == {"message": "The system cannot connect to the external application. Please try again later. If the problem persists, contact GHGRegulator@gov.bc.ca for help."}
