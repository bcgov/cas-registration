from unittest.mock import patch
from compliance.dataclass import RefreshWrapperReturn
from django.test import SimpleTestCase, override_settings, Client
from registration.utils import custom_reverse_lazy

VALIDATE_PERMISSION_PATH = "common.permissions.validate_all"
ELICENSING_DATA_REFRESH_SERVICE = (
    "compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService"
)
ELICENSING_REFRESH_DATA_WRAPPER_PATH = (
    f"{ELICENSING_DATA_REFRESH_SERVICE}.refresh_data_wrapper_by_compliance_report_version_id"
)
ELICENSING_REFRESH_DATA_WRAPPER_METADATA_PATH = f"{ELICENSING_DATA_REFRESH_SERVICE}.get_last_refreshed_metadata"


@override_settings(MIDDLEWARE=[])  # Disable middleware to prevent DB queries
class TestGetLastRefreshedMetadataEndpoint(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.client = Client()
        cls.compliance_report_version_id = 42

    def _get_endpoint_url(self):
        return custom_reverse_lazy(
            "get_last_refreshed_metadata", kwargs={"compliance_report_version_id": self.compliance_report_version_id}
        )

    @patch(ELICENSING_REFRESH_DATA_WRAPPER_METADATA_PATH)
    @patch(ELICENSING_REFRESH_DATA_WRAPPER_PATH)
    @patch(VALIDATE_PERMISSION_PATH)
    def test_get_last_refreshed_metadata_success(self, mock_permission, mock_refresh_data, mock_refresh_data_metadata):
        # Arrange
        mock_permission.return_value = True
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=None)
        payload = {
            "data_is_fresh": True,
            "last_refreshed_display": "2025-08-25 19:37:03 UTC",
        }
        mock_refresh_data_metadata.return_value = payload

        # Act
        response = self.client.get(self._get_endpoint_url())

        # Assert
        assert response.status_code == 200
        mock_refresh_data.assert_called_once()
        mock_refresh_data_metadata.assert_called_once()
        assert response.json() == payload
