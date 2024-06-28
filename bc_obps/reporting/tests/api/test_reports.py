import json
import pytest
from typing import Any
from django.http import HttpResponse
from django.test import Client
from registration.tests.utils.bakers import operation_baker
from reporting.models.report import Report
from reporting.tests.utils.bakers import report_baker, reporting_year_baker


@pytest.mark.django_db
class TestReportsEndpoint:
    endpoint_under_test = "/api/reporting/reports"
    client = Client()

    def send_post_request(self, request_data: dict[str, Any]) -> HttpResponse:
        return self.client.post(
            self.endpoint_under_test, data=json.dumps(request_data), content_type="application/json"
        )

    def test_error_if_no_operation_exists(self):
        reporting_year = reporting_year_baker()

        request_data = {
            "operation_id": "00000000-0000-0000-0000-000000000000",
            "reporting_year": reporting_year.reporting_year,
        }
        response = self.send_post_request(request_data)

        assert response.status_code == 404
        assert response.json()["message"] == "Not Found"

    def test_error_if_no_reporting_year_exists(self):
        operation = operation_baker()

        request_data = {"operation_id": str(operation.id), "reporting_year": 2000}
        response = self.send_post_request(request_data)

        assert response.status_code == 404
        assert response.json()["message"] == "Not Found"

    def test_error_if_report_exists(self):
        report = report_baker()

        request_data = {
            "operation_id": str(report.operation.id),
            "reporting_year": report.reporting_year.reporting_year,
        }
        response = self.send_post_request(request_data)

        assert response.status_code == 400
        assert (
            response.json()["message"]
            == "A report already exists for this operation and year, unable to create a new one."
        )

    def test_creates_report_and_returns_http_created(self):
        operation = operation_baker()
        reporting_year = reporting_year_baker()

        assert Report.objects.count() == 0

        request_data = {
            "operation_id": str(operation.id),
            "reporting_year": reporting_year.reporting_year,
        }
        response = self.send_post_request(request_data)

        assert Report.objects.count() == 1
        assert response.status_code == 201
        assert response.json() == Report.objects.first().id
