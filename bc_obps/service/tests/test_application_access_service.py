from service.application_access_service import ApplicationAccessService
import pytest
from model_bakery import baker
from registration.models import User, UserOperator
from registration.tests.utils.bakers import operator_baker

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
            match="Your business BCeID does not have access to this operator. Please contact your operator's administrator to request the correct business BCeID. If this issue persists, please contact <a href='mailto:GHGRegulator@gov.bc.ca'>ghgregulator@gov.bc.ca</a>",
        ):
            ApplicationAccessService.is_user_eligible_to_request_access(operator.id, user.user_guid)
