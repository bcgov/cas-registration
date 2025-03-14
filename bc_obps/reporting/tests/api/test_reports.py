import json
from typing import Any
from unittest.mock import patch, MagicMock

from django.http import HttpResponse
from model_bakery import baker

from registration.tests.utils.bakers import operation_baker, operator_baker
from registration.utils import custom_reverse_lazy
from reporting.models import Report, ReportVersion
from reporting.tests.utils.bakers import report_baker, reporting_year_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestReportsEndpoint(CommonTestSetup):
    endpoint_under_test = "/api/reporting/create-report"

    def send_authorized_post_request(self, request_data: dict[str, Any]) -> HttpResponse:
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        return TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            json.dumps(request_data),
            self.endpoint_under_test,
        )

    def test_error_if_no_operation_exists(self):
        reporting_year = reporting_year_baker()

        request_data = {
            "operation_id": "00000000-0000-0000-0000-000000000000",
            "reporting_year": reporting_year.reporting_year,
        }
        response = self.send_authorized_post_request(request_data)

        assert response.status_code == 404
        assert response.json()["message"] == "Not Found"

    def test_error_if_no_reporting_year_exists(self):
        operation = operation_baker()

        request_data = {"operation_id": str(operation.id), "reporting_year": 2000}
        response = self.send_authorized_post_request(request_data)

        assert response.status_code == 404
        assert response.json()["message"] == "Not Found"

    def test_error_if_report_exists(self):
        report = report_baker()

        request_data = {
            "operation_id": str(report.operation.id),
            "reporting_year": report.reporting_year.reporting_year,
        }
        response = self.send_authorized_post_request(request_data)

        assert response.status_code == 400
        assert (
            response.json()["message"]
            == "A report already exists for this operation and year, unable to create a new one."
        )

    def test_creates_report_and_returns_http_created(self):
        operation = operation_baker()
        reporting_year = reporting_year_baker()

        assert Report.objects.count() == 0
        assert ReportVersion.objects.count() == 0

        request_data = {
            "operation_id": str(operation.id),
            "reporting_year": reporting_year.reporting_year,
        }
        response = self.send_authorized_post_request(request_data)

        assert Report.objects.count() == 1
        assert ReportVersion.objects.count() == 1
        assert response.status_code == 201
        assert response.json() == ReportVersion.objects.first().id

    @patch("service.report_service.ReportService.get_registration_purpose_by_version_id")
    def test_get_registration_purpose_by_version_id_returns_expected_data(
        self, mock_get_registration_purpose: MagicMock
    ):
        report_version = baker.make_recipe("reporting.tests.utils.report_version")
        expected_data = {"registration_purpose": "Annual Emissions Report"}
        mock_get_registration_purpose.return_value = expected_data
        TestUtils.authorize_current_user_as_operator_user(self, operator=report_version.report.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_registration_purpose_by_version_id",
                kwargs={"version_id": report_version.id},
            ),
        )

        assert response.status_code == 200
        assert response.json() == expected_data
        mock_get_registration_purpose.assert_called_once_with(report_version.id)
