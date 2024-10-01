import json
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import operator_baker
from model_bakery import baker


class TestActivityData(CommonTestSetup):
    # AUTHORIZATION
    def test_unauthorized_users_cannot_get_activity_data(self):
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_pending',
            f'/api/reporting/report-version/{facility_report.report_version_id}/facility-report/{facility_report.facility_id}/initial-activity-data?activity_id=1',
        )
        assert response.status_code == 401

    def test_authorized_users_can_get_activity_data(self):
        operator = operator_baker()
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'/api/reporting/report-version/{facility_report.report_version_id}/facility-report/{facility_report.facility_id}/initial-activity-data?activity_id=1',
        )

        assert response.status_code == 200
        response_object = json.loads(response.json())
        assert response_object['activityId'] == 1
        # There are 2 source types in the map
        assert len(response_object['sourceTypeMap'].keys()) == 2

    def test_invalid_without_activity(self):
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'/api/reporting/report-version/{facility_report.report_version_id}/facility-report/{facility_report.facility_id}/initial-activity-data',
        )

        assert response.status_code == 422
