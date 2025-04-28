from model_bakery import baker
from registration.models import (
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
from registration.enums.enums import AccessRequestStates, AccessRequestTypes


class TestUpdateUserOperatorStatusEndpoint(CommonTestSetup):
    def test_industry_user_approves_access_request(self, mocker):
        operator = operator_baker({"status": Operator.Statuses.APPROVED})
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        subsequent_user_operator = baker.make(UserOperator, operator=operator)
        mock_send_operator_access_request_email = mocker.patch(
            "service.user_operator_service.send_operator_access_request_email"
        )
        response = TestUtils.mock_patch_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                "role": UserOperator.Roles.REPORTER,
                "status": UserOperator.Statuses.APPROVED,
            },
            custom_reverse_lazy(
                "update_user_operator_status",
                kwargs={
                    "user_operator_id": subsequent_user_operator.id,
                },
            ),
        )
        # # Assert that the email notification was called
        mock_send_operator_access_request_email.assert_called_once_with(
            AccessRequestStates.APPROVED,
            AccessRequestTypes.OPERATOR_WITH_ADMIN,
            operator.legal_name,
            subsequent_user_operator.user.get_full_name(),
            subsequent_user_operator.user.email,
        )
        assert response.status_code == 200

    def test_industry_user_cannot_approve_access_request_from_a_different_operator(
        self,
    ):
        operator = operator_baker({"status": Operator.Statuses.APPROVED})
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        other_operator = operator_baker({"status": Operator.Statuses.APPROVED})
        other_user_operator = baker.make(UserOperator, operator=other_operator)
        response = TestUtils.mock_patch_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                "role": UserOperator.Roles.REPORTER,
                "status": UserOperator.Statuses.APPROVED,
            },
            custom_reverse_lazy(
                "update_user_operator_status",
                kwargs={
                    "user_operator_id": other_user_operator.id,
                },
            ),
        )
        assert response.status_code == 403

    def test_cas_analyst_approves_access_request_with_existing_operator(self, mocker):
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', role=UserOperator.Roles.ADMIN, user=self.user
        )
        pending_user_operator = baker.make_recipe(
            'registration.tests.utils.user_operator', operator=approved_admin_user_operator.operator
        )

        pending_user_operator.user.business_guid = approved_admin_user_operator.user.business_guid

        mock_send_operator_access_request_email = mocker.patch(
            "service.user_operator_service.send_operator_access_request_email"
        )
        response = TestUtils.mock_patch_with_auth_role(
            self,
            "cas_analyst",
            self.content_type,
            {
                "role": UserOperator.Roles.ADMIN,
                "status": UserOperator.Statuses.APPROVED,
            },
            custom_reverse_lazy(
                "update_user_operator_status",
                kwargs={
                    "user_operator_id": pending_user_operator.id,
                },
            ),
        )
        assert response.status_code == 200
        pending_user_operator.refresh_from_db()  # refresh the pending_user_operator object to get the updated status
        assert pending_user_operator.status == UserOperator.Statuses.APPROVED
        assert pending_user_operator.role == UserOperator.Roles.ADMIN
        assert pending_user_operator.verified_by == self.user
        # Assert that the email notification was called
        mock_send_operator_access_request_email.assert_called_once_with(
            AccessRequestStates.APPROVED,
            AccessRequestTypes.ADMIN,
            approved_admin_user_operator.operator.legal_name,
            pending_user_operator.user.get_full_name(),
            pending_user_operator.user.email,
        )

    def test_cas_director_approves_admin_access_request(self, mocker):
        # In this test we are testing the user operator status change and not the operator change,
        # so we have to mark the operator as status=APPROVED so we can bypass the below part and can get to the email sending part
        operator = operator_baker({'status': Operator.Statuses.APPROVED})
        operator.refresh_from_db()
        user_operator = user_operator_baker({'operator': operator, 'user': operator.created_by})
        mock_send_operator_access_request_email = mocker.patch(
            "service.user_operator_service.send_operator_access_request_email"
        )
        response_2 = TestUtils.mock_patch_with_auth_role(
            self,
            'cas_director',
            self.content_type,
            {
                "role": UserOperator.Roles.ADMIN,
                "status": UserOperator.Statuses.APPROVED,
            },
            custom_reverse_lazy(
                'update_user_operator_status',
                kwargs={
                    "user_operator_id": user_operator.id,
                },
            ),
        )
        assert response_2.status_code == 200
        user_operator.refresh_from_db()  # refresh the user_operator object to get the updated status
        assert user_operator.status == UserOperator.Statuses.APPROVED
        assert user_operator.role == UserOperator.Roles.ADMIN
        assert user_operator.verified_by == self.user
        # Assert that the email notification was called (user associated with the user_operator IS the creator of the operator)
        mock_send_operator_access_request_email.assert_called_once_with(
            AccessRequestStates.APPROVED,
            AccessRequestTypes.ADMIN,
            operator.legal_name,
            user_operator.user.get_full_name(),
            user_operator.user.email,
        )

    def test_cas_analyst_declines_access_request(self, mocker):
        user = baker.make(User)
        operator = operator_baker()
        operator.status = Operator.Statuses.APPROVED
        operator.save(update_fields=["status"])
        user_operator = user_operator_baker()
        user_operator.user_id = user.user_guid
        user_operator.operator = operator
        user_operator.save(update_fields=["user_id", "operator_id"])

        mock_send_operator_access_request_email = mocker.patch(
            "service.user_operator_service.send_operator_access_request_email"
        )
        # Now decline the user_operator and make sure the contacts are deleted
        response = TestUtils.mock_patch_with_auth_role(
            self,
            "cas_analyst",
            self.content_type,
            {
                "status": UserOperator.Statuses.DECLINED,
            },
            custom_reverse_lazy(
                "update_user_operator_status",
                kwargs={
                    "user_operator_id": user_operator.id,
                },
            ),
        )
        assert response.status_code == 200
        user_operator.refresh_from_db()  # refresh the user_operator object to get the updated status
        assert user_operator.status == UserOperator.Statuses.DECLINED
        assert user_operator.role == UserOperator.Roles.PENDING
        assert user_operator.verified_by == self.user
        # Assert that the email notification was sent
        mock_send_operator_access_request_email.assert_called_once_with(
            AccessRequestStates.DECLINED,
            AccessRequestTypes.ADMIN,
            operator.legal_name,
            user_operator.user.get_full_name(),
            user_operator.user.email,
        )
