from common.enums import AccessRequestStates, AccessRequestTypes
from common.service.email.email_service import EmailService
from model_bakery import baker
from registration.models import (
    BusinessRole,
    Contact,
    Operator,
    User,
    UserOperator,
)
from registration.tests.utils.bakers import (
    operator_baker,
    user_operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestUserOperatorUpdateStatusEndpoint(CommonTestSetup):
    def test_user_operator_put_cannot_update_status_when_operator_not_approved(self):
        user = baker.make(User)

        operator = operator_baker()
        operator.status = Operator.Statuses.PENDING
        operator.save(update_fields=["status"])
        user_operator = user_operator_baker()
        user_operator.user_id = user.user_guid
        user_operator.operator = operator
        user_operator.save(update_fields=["user_id", "operator_id"])

        response_1 = TestUtils.mock_put_with_auth_role(
            self,
            "cas_admin",
            self.content_type,
            {
                "status": UserOperator.Statuses.APPROVED,
                "user_operator_id": user_operator.id,
            },
            custom_reverse_lazy("update_user_operator_status"),
        )
        # make sure user can't change the status of a user_operator when operator is not approved
        assert response_1.status_code == 400
        response_1_json = response_1.json()
        assert response_1_json == {"message": "Operator must be approved before approving or declining users."}

    def test_industry_user_can_update_status_of_a_user_operator(self, mocker):
        operator = operator_baker({"status": Operator.Statuses.APPROVED, "is_new": False})
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        subsequent_user_operator = baker.make(UserOperator, operator=operator)
        mock_send_operator_access_request_email = mocker.patch.object(
            EmailService, "send_operator_access_request_email"
        )
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                "role": UserOperator.Roles.REPORTER,
                "status": UserOperator.Statuses.APPROVED,
                "user_operator_id": subsequent_user_operator.id,
            },
            custom_reverse_lazy("update_user_operator_status"),
        )
        # Assert that the email notification was called
        mock_send_operator_access_request_email.assert_called_once_with(
            AccessRequestStates.APPROVED,
            AccessRequestTypes.OPERATOR_WITH_ADMIN,
            operator.legal_name,
            subsequent_user_operator.user.get_full_name(),
            subsequent_user_operator.user.email,
        )
        assert response.status_code == 200

    def test_industry_user_cannot_update_status_of_a_user_operator_from_a_different_operator(
        self,
    ):
        operator = operator_baker({"status": Operator.Statuses.APPROVED, "is_new": False})
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        other_operator = operator_baker({"status": Operator.Statuses.APPROVED, "is_new": False})
        other_user_operator = baker.make(UserOperator, operator=other_operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                "role": UserOperator.Roles.REPORTER,
                "status": UserOperator.Statuses.APPROVED,
                "user_operator_id": other_user_operator.id,
            },
            custom_reverse_lazy("update_user_operator_status"),
        )
        assert response.status_code == 403

    def test_cas_admin_can_update_status_of_a_user_operator(self, mocker):
        operator = operator_baker({"status": Operator.Statuses.APPROVED, "is_new": False})
        user_operator = user_operator_baker({"operator": operator})
        mock_send_operator_access_request_email = mocker.patch.object(
            EmailService, "send_operator_access_request_email"
        )
        response_2 = TestUtils.mock_put_with_auth_role(
            self,
            "cas_admin",
            self.content_type,
            {
                "role": UserOperator.Roles.ADMIN,
                "status": UserOperator.Statuses.APPROVED,
                "user_operator_id": user_operator.id,
            },
            custom_reverse_lazy("update_user_operator_status"),
        )
        assert response_2.status_code == 200
        user_operator.refresh_from_db()  # refresh the user_operator object to get the updated status
        assert user_operator.status == UserOperator.Statuses.APPROVED
        assert user_operator.role == UserOperator.Roles.ADMIN
        assert user_operator.verified_by == self.user
        # Assert that the email notification was called
        mock_send_operator_access_request_email.assert_called_once_with(
            AccessRequestStates.APPROVED,
            AccessRequestTypes.ADMIN,
            operator.legal_name,
            user_operator.user.get_full_name(),
            user_operator.user.email,
        )

    def test_user_operator_put_decline_rejects_everything(self, mocker):
        user = baker.make(User)
        operator = operator_baker()
        operator.status = Operator.Statuses.APPROVED
        operator.is_new = False
        operator.save(update_fields=["status", "is_new"])
        user_operator = user_operator_baker()
        user_operator.user_id = user.user_guid
        user_operator.operator = operator
        user_operator.save(update_fields=["user_id", "operator_id"])
        # Assigning contacts to the operator of the user_operator
        contacts = baker.make(
            Contact,
            _quantity=2,
            created_by=user_operator.user,
            business_role=BusinessRole.objects.get(role_name="Senior Officer"),
        )
        user_operator.operator.contacts.set(contacts)
        mock_send_operator_access_request_email = mocker.patch.object(
            EmailService, "send_operator_access_request_email"
        )
        # Now decline the user_operator and make sure the contacts are deleted
        response = TestUtils.mock_put_with_auth_role(
            self,
            "cas_admin",
            self.content_type,
            {
                "status": UserOperator.Statuses.DECLINED,
                "user_operator_id": user_operator.id,
            },
            custom_reverse_lazy("update_user_operator_status"),
        )
        assert response.status_code == 200
        user_operator.refresh_from_db()  # refresh the user_operator object to get the updated status
        assert user_operator.status == UserOperator.Statuses.DECLINED
        assert user_operator.role == UserOperator.Roles.PENDING
        assert user_operator.verified_by == self.user
        assert user_operator.operator.contacts.count() == 0
        assert Contact.objects.count() == 0
        # Assert that the email notification was sent
        mock_send_operator_access_request_email.assert_called_once_with(
            AccessRequestStates.DECLINED,
            AccessRequestTypes.ADMIN,
            operator.legal_name,
            user_operator.user.get_full_name(),
            user_operator.user.email,
        )
