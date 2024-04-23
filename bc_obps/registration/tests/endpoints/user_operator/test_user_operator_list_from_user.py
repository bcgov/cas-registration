import json
from model_bakery import baker
from registration.models import (
    User,
    UserOperator,
)
from registration.tests.utils.bakers import (
    operator_baker,
    user_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestUserOperatorListFromUserEndpoint(CommonTestSetup):
    def test_get_an_operators_user_operators_by_users_list(self):
        operator = operator_baker()
        # two UserOperator with the same operator
        baker.make(
            UserOperator,
            user=self.user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )
        baker.make(
            UserOperator,
            user=baker.make(User, business_guid=self.user.business_guid),
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )
        # a UserOperator with a different operator
        baker.make(
            UserOperator,
            user=user_baker(),
            operator=operator_baker(),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('get_user_operator_list_from_user')
        )

        assert len(json.loads(response.content)) == 2
