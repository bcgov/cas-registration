import json
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import operator_baker
from model_bakery import baker

from registration.utils import custom_reverse_lazy


class TestActivityData(CommonTestSetup):
    def test_authorized_users_can_get_activity_data(self):
        operator = baker.make_recipe("registration.tests.utils.operator")
        facility_report = baker.make_recipe(
            'reporting.tests.utils.facility_report',
            report_version__report__reporting_year_id=2025,
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_initial_activity_data",
                kwargs={'version_id': facility_report.report_version_id, 'facility_id': facility_report.facility_id},
            )
            + "?activity_id=1",
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
            custom_reverse_lazy(
                "get_initial_activity_data",
                kwargs={'version_id': facility_report.report_version_id, 'facility_id': facility_report.facility_id},
            ),
        )

        assert response.status_code == 422
