import json
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import operator_baker
from registration.utils import custom_reverse_lazy


class TestActivityData(CommonTestSetup):
    endpoint = custom_reverse_lazy("get_initial_activity_data")

    # AUTHORIZATION
    def test_unauthorized_users_cannot_get_activity_data(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401

    def test_authorized_users_can_get_activity_data(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{self.endpoint}?activity_name=General stationary combustion excluding line tracing&report_date=2024-05-01',
        )

        assert response.status_code == 200
        response_object = json.loads(response.json())
        assert response_object['activityId'] == 1
        # There are 2 source types in the map
        assert len(response_object['sourceTypeMap'].keys()) == 2

    def test_invalid_without_report_date(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{self.endpoint}?activity_name=General stationary combustion excluding line tracing',
        )

        assert response.status_code == 422

    def test_invalid_without_activity(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{self.endpoint}?report_date=2024-05-01',
        )

        assert response.status_code == 422
