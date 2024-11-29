from model_bakery import baker
from registration.models import (
    Operator,
    UserOperator,
)
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestUserOperatorEndpointAuthorization(CommonTestSetup):
    def test_unauthorized_users_cannot_put(self):
        # only industry_user admins can change statuses
        operator = operator_baker({'status': Operator.Statuses.APPROVED, 'is_new': False})
        user_operator_2 = TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        user_operator_2.role = UserOperator.Roles.REPORTER
        user_operator_2.save()

        subsequent_user_operator = baker.make(UserOperator, operator=operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            {"role": UserOperator.Roles.REPORTER, "status": UserOperator.Statuses.APPROVED},
            custom_reverse_lazy(
                'v1_update_user_operator_status', kwargs={"user_operator_id": subsequent_user_operator.id}
            ),
        )
        assert response.status_code == 401
