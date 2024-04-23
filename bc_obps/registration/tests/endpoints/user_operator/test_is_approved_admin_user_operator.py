from model_bakery import baker
from registration.models import (
    User,
    UserOperator,
)
from registration.tests.utils.bakers import (
    user_operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestUserOperatorIsApprovedAdminUserOperatorEndpoint(CommonTestSetup):
    def test_is_approved_admin_user_operator_with_approved_user(self):
        # self is an approved user_operator (this endpoint requires approval to access)
        user_operator_baker({"user": self.user, "status": UserOperator.Statuses.APPROVED})

        mock_user = baker.make(User)
        mock_user_operator = user_operator_baker()
        mock_user_operator.user_id = mock_user.user_guid
        mock_user_operator.role = UserOperator.Roles.ADMIN
        mock_user_operator.status = UserOperator.Statuses.APPROVED
        mock_user_operator.save(update_fields=["user_id", "role", "status"])
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "is_approved_admin_user_operator",
                kwargs={"user_guid": mock_user.user_guid},
            ),
        )
        assert response.status_code == 200
        assert response.json() == {"approved": True}

    def test_is_approved_admin_user_operator_without_approved_user(self):
        # self is an approved user_operator (this endpoint requires approval to access)
        user_operator_baker({"user": self.user, "status": UserOperator.Statuses.APPROVED})
        mock_user = baker.make(User)
        mock_user_operator = user_operator_baker()
        mock_user_operator.user_id = mock_user.user_guid
        mock_user_operator.role = UserOperator.Roles.ADMIN
        mock_user_operator.status = UserOperator.Statuses.PENDING
        mock_user_operator.save(update_fields=["user_id", "role", "status"])
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "is_approved_admin_user_operator",
                kwargs={"user_guid": mock_user.user_guid},
            ),
        )
        assert response.status_code == 200
        assert response.json() == {"approved": False}
