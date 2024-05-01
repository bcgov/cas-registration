from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from common.service.email.email_service import EmailService
from registration.models import (
    UserOperator,
)
from registration.tests.utils.bakers import (
    operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestSelectOperatorRequestAccessEndpoint(CommonTestSetup):
    def test_request_admin_access_with_valid_payload(self, mocker):
        operator = operator_baker()
        mock_send_operator_access_request_email = mocker.patch.object(
            EmailService, "send_operator_access_request_email"
        )
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {"operator_id": operator.id},
            custom_reverse_lazy("request_admin_access"),
        )

        # Assert that the email notification was sent
        mock_send_operator_access_request_email.assert_called_once_with(
            AccessRequestStates.CONFIRMATION,
            AccessRequestTypes.ADMIN,
            operator.legal_name,
            self.user.get_full_name(),
            self.user.email,
        )

        response_json = response.json()

        assert response.status_code == 201
        assert "user_operator_id" in response_json

        user_operator_exists = UserOperator.objects.filter(
            id=response_json["user_operator_id"],
            user=self.user,
            operator=operator,
            status=UserOperator.Statuses.PENDING,
            role=UserOperator.Roles.PENDING,
        ).exists()

        assert user_operator_exists, "UserOperator object was not created"

    def test_request_access_with_invalid_payload(self):
        invalid_payload = {"operator_id": 99999}  # Invalid operator ID

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            invalid_payload,
            custom_reverse_lazy("request_admin_access"),
        )
        assert response.status_code == 422
        assert response.json().get("detail")[0].get("msg") == "UUID input should be a string, bytes or UUID object"
