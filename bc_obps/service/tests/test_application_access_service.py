from service.application_access_service import ApplicationAccessService
import pytest
from model_bakery import baker
from registration.models import User, UserOperator
from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup

pytestmark = pytest.mark.django_db


class TestCheckUserAdminRequestEligibility:
    @staticmethod
    def test_user_eligible_for_admin_request():
        user = baker.make(User)
        operator = operator_baker()
        assert (
            ApplicationAccessService.is_user_eligible_to_request_admin_access(
                operator.id,
                user.user_guid,
            )
            is True
        )

    @staticmethod
    def test_user_already_admin_for_operator():
        user = baker.make(User)
        operator = operator_baker()
        baker.make(
            UserOperator,
            user=user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        with pytest.raises(Exception, match="You are already an admin for this Operator!"):
            ApplicationAccessService.is_user_eligible_to_request_admin_access(
                operator.id,
                user.user_guid,
            )

    @staticmethod
    def test_operator_already_has_admin():
        user = baker.make(User)
        admin_user = baker.make(User)
        operator = operator_baker()
        baker.make(
            UserOperator,
            user=admin_user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        with pytest.raises(Exception, match="This Operator already has an admin user!"):
            ApplicationAccessService.is_user_eligible_to_request_admin_access(
                operator.id,
                user.user_guid,
            )

    @staticmethod
    def test_user_already_has_pending_request():
        user = baker.make(User)
        operator = operator_baker()
        baker.make(
            UserOperator,
            user=user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.PENDING,
        )

        with pytest.raises(Exception, match="You already have a pending request for this Operator!"):
            ApplicationAccessService.is_user_eligible_to_request_admin_access(
                operator.id,
                user.user_guid,
            )

    @staticmethod
    def test_user_business_guid_matches_admin():
        admin_user = baker.make(User)
        user = baker.make(
            User,
            business_guid=admin_user.business_guid,
        )
        operator = operator_baker()

        baker.make(
            UserOperator,
            user=admin_user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        assert (
            ApplicationAccessService.is_user_eligible_to_request_access(
                operator.id,
                user.user_guid,
            )
            is True
        )

    @staticmethod
    def test_user_business_guid_not_match_admin():
        admin_user = baker.make(User)
        user = baker.make(User)
        operator = operator_baker()

        baker.make(
            UserOperator,
            user=admin_user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )
        with pytest.raises(
            Exception,
            match="Your business BCeID does not have access to this operator. Please contact your operator's administrator to request the correct business BCeID. If this issue persists, please contact",
        ):
            ApplicationAccessService.is_user_eligible_to_request_access(operator.id, user.user_guid)


class TestRequestAccess(CommonTestSetup):
    def test_request_admin_access(self, mocker):
        operator = operator_baker()
        user_requesting_admin = baker.make(User)

        mock_email_service = mocker.patch('service.application_access_service.send_operator_access_request_email')

        response = ApplicationAccessService.request_admin_access(operator.id, user_requesting_admin.user_guid)

        assert response.get('user_operator_id') is not None
        assert response.get('operator_id') == operator.id

        mock_email_service.assert_called_once_with(
            AccessRequestStates.CONFIRMATION,
            AccessRequestTypes.ADMIN,
            operator.legal_name,
            user_requesting_admin.get_full_name(),
            user_requesting_admin.email,
        )

    def test_request_access(self, mocker):
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
            role=UserOperator.Roles.ADMIN,
            user=self.user,
            status=UserOperator.Statuses.APPROVED,
        )
        user = baker.make(User, business_guid=approved_admin_user_operator.user.business_guid)

        mock_email_service = mocker.patch('service.application_access_service.send_operator_access_request_email')

        response = ApplicationAccessService.request_access(approved_admin_user_operator.operator.id, user.user_guid)

        assert response.get('user_operator_id') is not None
        assert response.get('operator_id') == approved_admin_user_operator.operator.id

        mock_email_service.assert_called_once_with(
            AccessRequestStates.CONFIRMATION,
            AccessRequestTypes.OPERATOR_WITH_ADMIN,
            approved_admin_user_operator.operator.legal_name,
            user.get_full_name(),
            user.email,
        )
