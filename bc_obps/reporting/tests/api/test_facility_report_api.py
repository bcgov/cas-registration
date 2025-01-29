from unittest.mock import MagicMock, patch
from uuid import uuid4
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.models import FacilityReport
from registration.models import Activity
from model_bakery import baker

from reporting.schema.facility_report import FacilityReportListInSchema


class TestFacilityReportEndpoints(CommonTestSetup):
    # Ensure that this part is executed correctly
    # Create a report version to associate with the facility reports

    # GET
    def test_error_if_no_facility_report_exists(self):
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        TestUtils.authorize_current_user_as_operator_user(self, operator=facility_report.report_version.report.operator)

        endpoint_under_test = '/api/reporting/report-version/9999/facility-report/00000000-0000-0000-0000-000000000000'
        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', endpoint_under_test)

        assert response.status_code == 404
        assert response.json()["message"] == "Not Found"

    def test_error_if_no_invalid_facility_id(self):
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        TestUtils.authorize_current_user_as_operator_user(self, operator=facility_report.report_version.report.operator)

        endpoint_under_test = f'/api/reporting/report-version/{facility_report.report_version.id}/facility-report/1'
        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', endpoint_under_test)
        assert response.status_code == 422
        assert "Input should be a valid UUID" in response.json()["detail"][0]["msg"]

    def test_returns_correct_data(self):
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        TestUtils.authorize_current_user_as_operator_user(self, operator=facility_report.report_version.report.operator)

        endpoint_under_test = f'/api/reporting/report-version/{facility_report.report_version_id}/facility-report/{facility_report.facility_id}'
        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', endpoint_under_test)
        assert response.status_code == 200
        assert response.json()['facility_name'] == facility_report.facility_name

    ## Facility Report Activity List
    def test_returns_ordered_activity_list_for_facility_report(self):
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        TestUtils.authorize_current_user_as_operator_user(self, operator=facility_report.report_version.report.operator)
        a1 = Activity.objects.get(pk=1)
        a2 = Activity.objects.get(pk=14)
        a3 = Activity.objects.get(pk=28)
        facility_report.activities.add(a1, a2, a3)
        endpoint_under_test = f'/api/reporting/report-version/{facility_report.report_version_id}/facility-report/{facility_report.facility_id}/activity-list'
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user', endpoint_under_test)
        ordered_activities = [a1, a3, a2]
        assert response.status_code == 200
        assert len(response.json()) == 3
        assert response.json()[0]['id'] == ordered_activities[0].id
        assert response.json()[1]['id'] == ordered_activities[1].id
        assert response.json()[2]['id'] == ordered_activities[2].id

    # POST
    def test_saves_facility_data(self):
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        TestUtils.authorize_current_user_as_operator_user(self, operator=facility_report.report_version.report.operator)

        endpoint_under_test = f'/api/reporting/report-version/{facility_report.report_version_id}/facility-report/{facility_report.facility_id}'
        request_data = {
            "facility_name": "CHANGED",
            "facility_type": "Single Facility Operation",
            "facility_bcghgid": "abc12345",
            "activities": ["1", "2", "3"],
            "products": [],
        }

        TestUtils.mock_post_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            request_data,
            endpoint_under_test,
        )
        assert FacilityReport.objects.get(pk=facility_report.id).facility_name == "CHANGED"
        assert FacilityReport.objects.get(pk=facility_report.id).activities.count() == 3

    @patch("service.facility_report_service.FacilityReportService.save_facility_report_list")
    def test_patch_calls_the_save_service_with_correct_data(self, mock_save: MagicMock):
        self.report_version = baker.make_recipe('reporting.tests.utils.report_version')
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

        facility_id_1 = uuid4()
        facility_id_2 = uuid4()

        payload = [
            {"facility": facility_id_1, "is_completed": True},
            {"facility": facility_id_2, "is_completed": False},
        ]

        endpoint_under_test = f"/api/reporting/report-version/{self.report_version.id}/facility-report-list"
        response = TestUtils.mock_patch_with_auth_role(
            self, 'industry_user', 'application/json', payload, endpoint_under_test
        )

        assert response.status_code == 200
        mock_save.assert_called_once_with(
            self.report_version.id,
            [
                FacilityReportListInSchema(facility=facility_id_1, is_completed=True),
                FacilityReportListInSchema(facility=facility_id_2, is_completed=False),
            ],
        )
