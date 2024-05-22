from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from registration.models import UserOperator
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestOperatorRequestAdminAccessEndpoint(CommonTestSetup):
    def test_request_admin_access_with_valid_payload(self, mocker):
        operator = operator_baker()
        # We need to mock the send_operator_access_request_email function withing the application_access_service module
        mocked_send_access_request_email = mocker.patch(
            "service.application_access_service.send_operator_access_request_email"
        )
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {},
            custom_reverse_lazy("request_admin_access", kwargs={"operator_id": operator.id}),
        )

        # Assert that the email notification was sent
        mocked_send_access_request_email.assert_called_once_with(
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

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {},
            custom_reverse_lazy("request_admin_access", kwargs={"operator_id": 99999}),
        )
        assert response.status_code == 422
        assert (
            response.json().get("detail")[0].get("msg")
            == "Input should be a valid UUID, invalid length: expected length 32 for simple format, found 5"
        )
