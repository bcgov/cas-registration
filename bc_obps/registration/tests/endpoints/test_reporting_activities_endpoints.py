import pytest
from model_bakery import baker
from registration.models import ReportingActivity
from registration.tests.utils.helpers import CommonTestSetup, TestUtils

pytestmark = pytest.mark.django_db

base_endpoint = "/api/registration/"

content_type_json = "application/json"


class TestReportingActivitiesEndpoint(CommonTestSetup):
    endpoint = base_endpoint + "reporting_activities"

    def test_unauthorized_users_cannot_get(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401

    def test_get_method_for_200_status(self):
        roles = ["cas_analyst", "cas_admin", "industry_user"]
        for role in roles:
            response = TestUtils.mock_get_with_auth_role(self, role)
            assert response.status_code == 200

    def test_get_method_with_mock_data(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin")
        assert response.status_code == 200
