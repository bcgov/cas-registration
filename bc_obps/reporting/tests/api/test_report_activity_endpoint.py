import json
from types import SimpleNamespace
from unittest.mock import patch, MagicMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from model_bakery.baker import make_recipe


class TestReportActivityEndpoint(CommonTestSetup):
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save")
    def test_returns_the_service_output(self, mock_service: MagicMock):
        facility_report = make_recipe('reporting.tests.utils.facility_report')
        activity = make_recipe('reporting.tests.utils.activity')

        endpoint_under_test = (
            f"/api/reporting/report-version/{facility_report.report_version.id}"
            + f"/facilities/{facility_report.facility.id}"
            + f"/activity/{activity.id}/report-activity"
        )

        TestUtils.authorize_current_user_as_operator_user(self, operator=facility_report.report_version.report.operator)

        # Mocks returning an object with an id field
        mock_service.return_value = SimpleNamespace(id=12345)

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            content_type=self.content_type,
            data=json.dumps({"activity_data": {"test_data": "1"}}),
            endpoint=endpoint_under_test,
        )

        assert response.status_code == 200
        mock_service.assert_called_once_with({"test_data": "1"})
        assert response.json() == 12345
