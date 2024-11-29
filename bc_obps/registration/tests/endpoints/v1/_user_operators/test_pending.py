from registration.models import UserOperator
from registration.tests.utils.bakers import (
    user_operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestPendingUserOperatorEndpoint(CommonTestSetup):
    def test_get_user_operator(self):
        user_operator = user_operator_baker()
        user_operator.user_id = self.user.user_guid
        user_operator.save(update_fields=['user_id'])
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('v1_get_pending_operator_and_user_operator')
        )
        assert response.status_code == 200
        assert response.json()['status'] == user_operator.status
        assert response.json().get('is_new') is not None

    # /user-operators/current/user-operator-from-user ignores DECLINED records
    def test_get_user_operator_declined(self):
        user_operator = user_operator_baker()
        user_operator.user_id = self.user.user_guid
        user_operator.status = UserOperator.Statuses.DECLINED
        user_operator.save(update_fields=["user_id", "status"])
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("v1_get_pending_operator_and_user_operator")
        )
        assert response.status_code == 404
