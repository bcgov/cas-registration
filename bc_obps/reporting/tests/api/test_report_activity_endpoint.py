import json
from types import SimpleNamespace
from unittest.mock import patch, MagicMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from model_bakery.baker import make_recipe

from registration.utils import custom_reverse_lazy


class TestReportActivityEndpoint(CommonTestSetup):
    """Tests for the report activity endpoint"""

    def setup_method(self):
        """Set up before each test"""
        super().setup_method()

        # Create basic test data
        self.facility_report = make_recipe('reporting.tests.utils.facility_report')
        self.activity = make_recipe('reporting.tests.utils.activity')

        # Create endpoint
        self.endpoint = custom_reverse_lazy(
            "save_report_activity_data",
            kwargs={
                "report_version_id": self.facility_report.report_version.id,
                "facility_id": self.facility_report.facility.id,
                "activity_id": self.activity.id,
            },
        )

        # Create test payload
        self.test_payload = {"activity_data": {"test_data": "1"}}

        # Store operator for authorization
        self.operator = self.facility_report.report_version.report.operator

    def _make_request(self, role, authorize_operator=True):
        """Helper method to make a request with given role"""
        if authorize_operator:
            TestUtils.authorize_current_user_as_operator_user(self, operator=self.operator)

        return TestUtils.mock_post_with_auth_role(
            self,
            role,
            content_type=self.content_type,
            data=json.dumps(self.test_payload),
            endpoint=self.endpoint,
        )

    # SERVICE OUTPUT
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save")
    def test_returns_the_service_output(self, mock_service: MagicMock):
        """Test that the endpoint returns the service's output correctly"""
        # Arrange
        mock_service.return_value = SimpleNamespace(id=12345)

        # Act
        response = self._make_request("industry_user")

        # Assert
        assert response.status_code == 200
        mock_service.assert_called_once_with({"test_data": "1"})
        assert response.json() == 12345

    @patch("reporting.service.report_activity_serializer.ReportActivitySerializer.serialize")
    def test_get_returns_the_serialized_value_from_the_serializer(self, mock_serialize: MagicMock):
        raise NotImplementedError
