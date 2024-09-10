from django.test import Client
from model_bakery import baker
from registration.models import User
import json
import pytest
from registration.tests.utils.helpers import TestUtils
from registration.tests.utils.bakers import operator_baker

client = Client()


class TestSetup:
    pytestmark = pytest.mark.django_db  # This is used to mark a test function as requiring the database
    base_endpoint = "/api/reporting/"
    pytest.endpoint = base_endpoint + "initial-activity-data"

    def setup_method(self):
        self.content_type = "application/json"
        self.user = baker.make(
            User, app_role_id="industry_user", _fill_optional=True
        )  # Passing _fill_optional to fill all fields with random data
        self.auth_header = {'user_guid': str(self.user.user_guid)}
        self.auth_header_dumps = json.dumps(self.auth_header)


class TestActivityData(TestSetup):
    endpoint = "/api/reporting/" + "initial-activity-data"
    pytest.endpoint = "/api/reporting/" + "initial-activity-data"

    # AUTHORIZATION
    def test_unauthorized_users_cannot_get_activity_data(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401

    def test_authorized_users_can_get_activity_data(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        roles = ["industry_user"]
        for role in roles:
            response = TestUtils.mock_get_with_auth_role(
                self,
                role,
                pytest.endpoint
                + "?activity_name=General stationary combustion excluding line tracing&report_date=2024-05-01"
                + "&report_date=2024-09-06",
            )
            assert response.status_code == 200

    def test_invalid_without_report_date(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{pytest.endpoint}?activity_name=General stationary combustion excluding line tracing',
        )

        assert response.status_code == 422

    def test_invalid_without_activity(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{pytest.endpoint}?report_date=2024-05-01',
        )

        assert response.status_code == 422

    def test_returns_activity_data(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{pytest.endpoint}?activity_name=General stationary combustion excluding line tracing&report_date=2024-05-01',
        )

        assert response.status_code == 200
        response_object = json.loads(response.json())
        assert response_object['activityId'] == 1
        # There are 2 source types in the map
        assert len(response_object['sourceTypeMap'].keys()) == 2
