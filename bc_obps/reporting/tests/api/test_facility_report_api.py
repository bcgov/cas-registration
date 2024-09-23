import json
import pytest
from django.test import Client
from reporting.models import FacilityReport
from registration.tests.utils.bakers import user_baker
from model_bakery import baker

client = Client()


@pytest.mark.django_db
class TestFacilityReportEndpoints:
    # GET
    def test_error_if_no_facility_report_exists(self):
        response = client.get('/api/reporting/report-version/9999/facility-report/00000000-0000-0000-0000-000000000000')
        assert response.status_code == 404
        assert response.json()["message"] == "Not Found"

    def test_error_if_no_invalid_facility_id(self):
        response = client.get('/api/reporting/report-version/9999/facility-report/1')
        assert response.status_code == 422
        assert "Input should be a valid UUID" in response.json()["detail"][0]["msg"]

    def test_returns_correct_data(self):
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        response = client.get(
            f'/api/reporting/report-version/{facility_report.report_version_id}/facility-report/{facility_report.facility_id}'
        )
        assert response.status_code == 200
        assert response.json()['facility_name'] == facility_report.facility_name

    # POST
    def test_saves_facility_data(self):
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        request_data = {
            "facility_name": "CHANGED",
            "facility_type": "Single Facility Operation",
            "facility_bcghgid": "abc12345",
            "activities": ["1", "2", "3"],
            "products": [],
        }
        user = user_baker()
        client.post(
            f'/api/reporting/report-version/{facility_report.report_version_id}/facility-report/{facility_report.facility_id}',
            data=json.dumps(request_data),
            HTTP_AUTHORIZATION=json.dumps({"user_guid": f'{user.user_guid}'}),
            content_type="application/json",
        )
        assert FacilityReport.objects.get(pk=facility_report.id).facility_name == "CHANGED"
        assert FacilityReport.objects.get(pk=facility_report.id).activities.count() == 3
