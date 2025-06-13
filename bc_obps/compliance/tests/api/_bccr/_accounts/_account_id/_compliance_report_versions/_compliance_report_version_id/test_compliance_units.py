from unittest.mock import patch
from django.test import SimpleTestCase, override_settings, Client
from decimal import Decimal
from compliance.service.bc_carbon_registry.exceptions import BCCarbonRegistryError
from registration.utils import custom_reverse_lazy
from compliance.dataclass import BCCRUnit, ComplianceUnitsPageData

# Constants
VALID_ACCOUNT_ID = "123456789012345"
VALID_COMPLIANCE_REPORT_VERSION_ID = 1
APPLY_COMPLIANCE_UNITS_SERVICE_PATH = (
    "compliance.service.apply_compliance_units_service.ApplyComplianceUnitsService.get_apply_compliance_units_page_data"
)
PERMISSION_CHECK_PATH = "common.permissions.check_permission_for_role"


@override_settings(MIDDLEWARE=[])  # Disable middleware to prevent database queries
class TestComplianceUnitsEndpoint(SimpleTestCase):  # Use SimpleTestCase to avoid database access
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.client = Client()

    @staticmethod
    def _get_endpoint_url(account_id, compliance_report_version_id):
        return custom_reverse_lazy(
            "get_apply_compliance_units_page_data",
            kwargs={"account_id": account_id, "compliance_report_version_id": compliance_report_version_id},
        )

    @patch(APPLY_COMPLIANCE_UNITS_SERVICE_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_successful_compliance_units_retrieval(self, mock_permission, mock_service):
        # Arrange
        mock_permission.return_value = True
        mock_service.return_value = ComplianceUnitsPageData(
            bccr_trading_name="Test Company",
            bccr_compliance_account_id=VALID_ACCOUNT_ID,
            charge_rate=Decimal("40.00"),
            outstanding_balance="16000",
            bccr_units=[
                BCCRUnit(
                    id=1,
                    type="Earned Credits",
                    serial_number="BCE-2023-0001",
                    vintage_year=2023,
                    quantity_available="1000",
                )
            ],
        )

        # Act
        response = self.client.get(self._get_endpoint_url(VALID_ACCOUNT_ID, VALID_COMPLIANCE_REPORT_VERSION_ID))

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["bccr_trading_name"] == "Test Company"
        assert response_data["bccr_compliance_account_id"] == int(VALID_ACCOUNT_ID)
        assert response_data["charge_rate"] == "40.00"
        assert response_data["outstanding_balance"] == "16000"
        assert len(response_data["bccr_units"]) == 1
        assert response_data["bccr_units"][0]["type"] == "Earned Credits"
        assert response_data["bccr_units"][0]["serial_number"] == "BCE-2023-0001"

        # Verify service call
        mock_service.assert_called_once_with(
            account_id=VALID_ACCOUNT_ID,
            compliance_report_version_id=VALID_COMPLIANCE_REPORT_VERSION_ID,
        )

    @patch(PERMISSION_CHECK_PATH)
    def test_invalid_account_id_format(self, mock_permission):
        # Arrange
        mock_permission.return_value = True
        # Act
        response = self.client.get(self._get_endpoint_url("12345", VALID_COMPLIANCE_REPORT_VERSION_ID))
        # Assert
        assert response.status_code == 422
        assert "Account Id: String should match pattern" in response.json().get("message")

    @patch(APPLY_COMPLIANCE_UNITS_SERVICE_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_empty_account_details_response(self, mock_permission, mock_service):
        # Arrange
        mock_permission.return_value = True
        mock_service.return_value = ComplianceUnitsPageData(
            bccr_trading_name=None,
            bccr_compliance_account_id=None,
            charge_rate=None,
            outstanding_balance=None,
            bccr_units=[],
        )
        # Act
        response = self.client.get(self._get_endpoint_url(VALID_ACCOUNT_ID, VALID_COMPLIANCE_REPORT_VERSION_ID))
        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["bccr_trading_name"] is None
        assert response_data["bccr_compliance_account_id"] is None
        assert response_data["charge_rate"] is None
        assert response_data["outstanding_balance"] is None
        assert response_data["bccr_units"] == []

    @patch(APPLY_COMPLIANCE_UNITS_SERVICE_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_service_error_handling(self, mock_permission, mock_service):
        # Arrange
        mock_permission.return_value = True
        mock_service.side_effect = BCCarbonRegistryError("Service error")
        # Act
        response = self.client.get(self._get_endpoint_url(VALID_ACCOUNT_ID, VALID_COMPLIANCE_REPORT_VERSION_ID))
        # Assert
        assert response.status_code == 400
        assert response.json() == {
            "message": "The system cannot connect to the external application. Please try again later. If the problem persists, contact GHGRegulator@gov.bc.ca for help."
        }

    @patch(APPLY_COMPLIANCE_UNITS_SERVICE_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_no_compliance_units(self, mock_permission, mock_service):
        # Arrange
        mock_permission.return_value = True
        mock_service.return_value = ComplianceUnitsPageData(
            bccr_trading_name="Test Company",
            bccr_compliance_account_id=VALID_ACCOUNT_ID,
            charge_rate=Decimal("40.00"),
            outstanding_balance="16000",
            bccr_units=[],
        )

        # Act
        response = self.client.get(self._get_endpoint_url(VALID_ACCOUNT_ID, VALID_COMPLIANCE_REPORT_VERSION_ID))

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["bccr_trading_name"] == "Test Company"
        assert response_data["bccr_compliance_account_id"] == int(VALID_ACCOUNT_ID)
        assert response_data["charge_rate"] == "40.00"
        assert response_data["outstanding_balance"] == "16000"
        assert response_data["bccr_units"] == []
