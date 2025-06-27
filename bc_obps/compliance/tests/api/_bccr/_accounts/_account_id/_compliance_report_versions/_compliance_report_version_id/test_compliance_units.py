from unittest.mock import patch
from django.test import SimpleTestCase, override_settings, Client
from decimal import Decimal
from registration.utils import custom_reverse_lazy
from compliance.dataclass import BCCRUnit, ComplianceUnitsPageData

# Constants
VALID_ACCOUNT_ID = "123456789012345"
VALID_COMPLIANCE_REPORT_VERSION_ID = 1
APPLY_COMPLIANCE_UNITS_SERVICE_PATH = "compliance.service.bc_carbon_registry.apply_compliance_units_service.ApplyComplianceUnitsService.get_apply_compliance_units_page_data"
PERMISSION_CHECK_PATH = "common.permissions.check_permission_for_role"
APPLY_COMPLIANCE_UNITS_SERVICE_APPLY_PATH = "compliance.service.bc_carbon_registry.apply_compliance_units_service.ApplyComplianceUnitsService.apply_compliance_units"


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
                    id="1",
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
        assert response_data["bccr_compliance_account_id"] == VALID_ACCOUNT_ID
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
        assert response_data["bccr_compliance_account_id"] == VALID_ACCOUNT_ID
        assert response_data["charge_rate"] == "40.00"
        assert response_data["outstanding_balance"] == "16000"
        assert response_data["bccr_units"] == []


@override_settings(MIDDLEWARE=[])  # Disable middleware to prevent database queries
class TestApplyComplianceUnitsEndpoint(SimpleTestCase):  # Use SimpleTestCase to avoid database access
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.client = Client()

    @staticmethod
    def _get_endpoint_url(account_id, compliance_report_version_id):
        return custom_reverse_lazy(
            "apply_compliance_units",
            kwargs={"account_id": account_id, "compliance_report_version_id": compliance_report_version_id},
        )

    @patch(APPLY_COMPLIANCE_UNITS_SERVICE_APPLY_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_apply_compliance_units_success(self, mock_permission, mock_apply_compliance_units):
        # Arrange
        mock_permission.return_value = True
        mock_apply_compliance_units.return_value = None

        # Create test data
        test_units = [
            {
                "id": "1",
                "type": "Earned Credits",
                "serial_number": "BCE-2023-0001",
                "vintage_year": 2023,
                "quantity_available": 100,
                "quantity_to_be_applied": 50,
            },
            {
                "id": "2",
                "type": "Offset Units",
                "serial_number": "BCO-2023-0001",
                "vintage_year": 2023,
                "quantity_available": 200,
                "quantity_to_be_applied": 75,
            },
        ]

        payload = {
            "bccr_holding_account_id": VALID_ACCOUNT_ID,
            "bccr_compliance_account_id": "987654321098765",
            "bccr_units": test_units,
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
        mock_apply_compliance_units.assert_called_once_with(
            account_id=VALID_ACCOUNT_ID,
            payload=payload,
        )

    @patch(APPLY_COMPLIANCE_UNITS_SERVICE_APPLY_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_apply_compliance_units_with_units_having_zero_quantity(self, mock_permission, mock_apply_compliance_units):
        # Arrange
        mock_permission.return_value = True
        mock_apply_compliance_units.return_value = None

        test_units = [
            {
                "id": "1",
                "type": "Earned Credits",
                "serial_number": "BCE-2023-0001",
                "vintage_year": 2023,
                "quantity_available": 100,
                "quantity_to_be_applied": 1,
            },
            {
                "id": "2",
                "type": "Offset Units",
                "serial_number": "BCO-2023-0001",
                "vintage_year": 2023,
                "quantity_available": 200,
                "quantity_to_be_applied": 0,
            },
            {
                "id": "3",
                "type": "Offset Units",
                "serial_number": "BCO-2023-0002",
                "vintage_year": 2023,
                "quantity_available": 10,
                "quantity_to_be_applied": None,
            },
        ]

        payload = {
            "bccr_holding_account_id": VALID_ACCOUNT_ID,
            "bccr_compliance_account_id": "987654321098765",
            "bccr_units": test_units,
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

        # Verify service was called with units having zero/None quantities
        mock_apply_compliance_units.assert_called_once_with(
            account_id=VALID_ACCOUNT_ID,
            payload=payload,
        )

    @patch(PERMISSION_CHECK_PATH)
    def test_apply_compliance_units_invalid_account_id_format(self, mock_permission):
        # Arrange
        mock_permission.return_value = True
        invalid_account_id = "123"  # Not 15 digits

        payload = {
            "bccr_holding_account_id": invalid_account_id,
            "bccr_compliance_account_id": "987654321098765",
            "bccr_units": [],
        }

        # Act
        response = self.client.post(
            self._get_endpoint_url(invalid_account_id, VALID_COMPLIANCE_REPORT_VERSION_ID),
            data=payload,
            content_type="application/json",
        )

        # Assert
        assert response.status_code == 422  # Validation error
