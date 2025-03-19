from unittest.mock import patch, MagicMock
from django.test import Client
from registration.tests.utils.bakers import operator_baker, operation_baker

from registration.utils import custom_reverse_lazy
from reporting.tests.utils.bakers import report_baker, report_version_baker
from reporting.schema.report_history import ReportHistoryResponse
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestReportHistoryEndpoint(CommonTestSetup):
    endpoint_under_test = "/api/reporting/report-history/{report_id}"
    client = Client()

    @patch(
        "reporting.service.report_history_dashboard_service.ReportingHistoryDashboardService.get_report_versions_for_report_history_dashboard"
    )
    def test_get_report_history_returns_correct_data(self, mock_get_report_versions: MagicMock):
        """Test that the API endpoint returns the correct report versions."""

        report = report_baker()

        draft_version = report_version_baker(report=report, status="Draft")
        submitted_version = report_version_baker(report=report, status="Submitted")

        mock_get_report_versions.return_value = [
            ReportHistoryResponse(
                id=draft_version.id,
                updated_at=draft_version.updated_at,
                status=draft_version.status,
                report_type=draft_version.report_type,
                report_id=report.id,
                submitted_by=None,
            ),
            ReportHistoryResponse(
                id=submitted_version.id,
                updated_at=submitted_version.updated_at,
                status=submitted_version.status,
                report_type=submitted_version.report_type,
                report_id=report.id,
                submitted_by=None,
            ),
        ]
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response_json = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_report_history", kwargs={"report_id": report.id}),
        ).json()
        assert response_json['count'] == 2
        assert len(response_json["items"]) == 2

        statuses = {item["status"] for item in response_json["items"]}
        assert "Draft" in statuses
        assert "Submitted" in statuses

        mock_get_report_versions.assert_called_once_with(report.id)

    def test_get_report_operation_returns_correct_name(self):
        """Test that the report operation endpoint returns the correct operation name."""
        # Arrange: Create a report with an associated operation
        operation = operation_baker(name="Oil Extraction")
        report = report_baker(operation=operation)

        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        # Act: Make the API request
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_report_operation", kwargs={"report_id": report.id}),
        ).json()
        assert response["name"] == "Oil Extraction"
