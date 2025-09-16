from unittest.mock import patch
from compliance.dataclass import BCCRUnit, RefreshWrapperReturn
from django.test import SimpleTestCase, override_settings, Client
from compliance.service.bc_carbon_registry.exceptions import BCCarbonRegistryError
from registration.utils import custom_reverse_lazy

VALIDATE_PERMISSION_PATH = "common.permissions.validate_all"
SERVICE_PATH = "compliance.service.bc_carbon_registry.apply_compliance_units_service.ApplyComplianceUnitsService.get_applied_compliance_units_data"
CAN_APPLY_COMPLIANCE_UNITS_PATH = "compliance.service.bc_carbon_registry.apply_compliance_units_service.ApplyComplianceUnitsService.can_apply_compliance_units"
ELICENSING_DATA_REFRESH_WRAPPER_PATH = "compliance.service.bc_carbon_registry.apply_compliance_units_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"


@override_settings(MIDDLEWARE=[])  # Disable middleware to prevent DB queries
class TestAppliedComplianceUnitsEndpoint(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.client = Client()
        cls.compliance_report_version_id = 42

    def _get_endpoint_url(self):
        return custom_reverse_lazy(
            "get_applied_compliance_units", kwargs={"compliance_report_version_id": self.compliance_report_version_id}
        )

    @patch(ELICENSING_DATA_REFRESH_WRAPPER_PATH)
    @patch(CAN_APPLY_COMPLIANCE_UNITS_PATH)
    @patch(SERVICE_PATH)
    @patch(VALIDATE_PERMISSION_PATH)
    def test_successful_applied_units_retrieval(self, mock_permission, mock_service, mock_can_apply, mock_refresh_data):
        # Arrange
        mock_permission.return_value = True
        mock_service.return_value = [
            BCCRUnit(
                id="1",
                type="Earned Credits",
                serial_number="SN-123",
                vintage_year=2025,
                quantity_applied="50",
                equivalent_value="4000.00",
            )
        ]
        mock_can_apply.return_value = True
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=None)

        # Act
        response = self.client.get(self._get_endpoint_url())

        # Assert
        assert response.status_code == 200
        assert response.json() == {
            "applied_compliance_units": [
                {
                    "id": "1",
                    "type": "Earned Credits",
                    "serial_number": "SN-123",
                    "vintage_year": 2025,
                    "quantity_applied": "50",
                    "equivalent_value": "4000.00",
                }
            ],
            "can_apply_compliance_units": True,
            "data_is_fresh": True,
        }

    @patch(ELICENSING_DATA_REFRESH_WRAPPER_PATH)
    @patch(CAN_APPLY_COMPLIANCE_UNITS_PATH)
    @patch(SERVICE_PATH)
    @patch(VALIDATE_PERMISSION_PATH)
    def test_empty_applied_units(self, mock_permission, mock_service, mock_can_apply, mock_refresh_data):
        mock_permission.return_value = True
        mock_service.return_value = []
        mock_can_apply.return_value = False
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=None)

        response = self.client.get(self._get_endpoint_url())

        assert response.status_code == 200
        assert response.json() == {
            "applied_compliance_units": [],
            "can_apply_compliance_units": False,
            "data_is_fresh": True,
        }

    @patch(SERVICE_PATH)
    @patch(VALIDATE_PERMISSION_PATH)
    def test_service_error_handling(self, mock_permission, mock_service):
        # Arrange
        mock_permission.return_value = True
        mock_service.side_effect = BCCarbonRegistryError("Service error")
        # Act
        response = self.client.get(self._get_endpoint_url())
        # Assert
        assert response.status_code == 400
        assert response.json() == {
            "message": "The system cannot connect to the external application. Please try again later. If the problem persists, contact GHGRegulator@gov.bc.ca for help."
        }
        mock_service.assert_called_once_with(compliance_report_version_id=self.compliance_report_version_id)
