from registration.models import ReportingActivity
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestReportingActivitiesEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_registration_endpoint + "reporting_activities"

    def test_unauthorized_users_cannot_get_reporting_activities(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401

    def test_authorized_users_can_get_reporting_activities(self):
        roles = ["cas_analyst", "cas_admin", "industry_user"]
        for role in roles:
            response = TestUtils.mock_get_with_auth_role(self, role)
            assert response.status_code == 200
            assert len(response.json()) == ReportingActivity.objects.count()
