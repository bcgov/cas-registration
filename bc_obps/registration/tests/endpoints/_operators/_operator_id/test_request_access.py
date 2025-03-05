from model_bakery import baker
from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from registration.models import (
    User,
    UserOperator,
)
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestOperatorRequestAccess(CommonTestSetup):
    def test_request_subsequent_access_with_valid_payload(self, mocker):
        operator = operator_baker()
        admin_user = baker.make(User, business_guid=self.user.business_guid)
        baker.make(
            UserOperator,
            user=admin_user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )
        mocked_send_access_request_email = mocker.patch(
            "service.application_access_service.send_operator_access_request_email"
        )
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {},
            custom_reverse_lazy("request_access", kwargs={"operator_id": operator.id}),
        )
        response_json = response.json()

        # Assert that the email notification was sent
        mocked_send_access_request_email.assert_called_once_with(
            AccessRequestStates.CONFIRMATION,
            AccessRequestTypes.OPERATOR_WITH_ADMIN,
            operator.legal_name,
            self.user.get_full_name(),
            self.user.email,
        )

        assert response.status_code == 201
        assert "user_operator_id" in response_json

        user_operator_exists = UserOperator.objects.filter(
            id=response_json["user_operator_id"],
            user=self.user,
            operator=operator,
            status=UserOperator.Statuses.PENDING,
        ).exists()

        assert user_operator_exists, "UserOperator object was not created"
