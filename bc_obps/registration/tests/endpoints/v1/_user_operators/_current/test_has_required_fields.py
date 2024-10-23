from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestGetCurrentUserOperatorHasRequiredFields(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "user-operators/current/has-required-fields"

    # AUTHORIZATION
    def test_unauthorized_users_cannot_get_endpoint(self):
        roles = ["cas_analyst", "cas_admin", "cas_pending"]
        for role in roles:
            response = TestUtils.mock_get_with_auth_role(self, role)
            assert response.status_code == 401

    def test_authorized_users_can_get_endpoint(self):
        roles = ["industry_user"]
        for role in roles:
            response = TestUtils.mock_get_with_auth_role(self, role)
            assert response.status_code == 200
