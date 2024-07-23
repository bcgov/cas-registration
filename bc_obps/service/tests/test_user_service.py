import pytest
from registration.models.app_role import AppRole
from registration.tests.utils.bakers import (
    user_baker,
    user_operator_baker,
)
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.user import User
from registration.models.user_operator import UserOperator
from registration.tests.utils.bakers import operator_baker
from model_bakery import baker
from service.user_service import UserService

pytestmark = pytest.mark.django_db


class TestUserService:
    @staticmethod
    def test_get_user_if_authorized_cas_user_success():
        admin_user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_analyst"))
        target_user = user_baker()
        result = UserService.get_if_authorized(admin_user.pk, target_user.pk)
        assert result == target_user

    @staticmethod
    def test_get_user_if_authorized_industry_user_success():
        admin_user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        target_user = user_baker(
            {'business_guid': admin_user.business_guid}
        )  # industry user admin can access user in same business(same business_guid)
        operator = operator_baker()
        user_operator_baker(
            {
                "user": admin_user,
                "operator": operator,
                "status": UserOperator.Statuses.APPROVED,
                "role": UserOperator.Roles.ADMIN,
            }
        )
        result = UserService.get_if_authorized(admin_user.pk, target_user.pk)
        assert result == target_user

    @staticmethod
    def test_get_user_if_authorized_industry_user_fail():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        target_user = user_baker()
        operator = operator_baker()
        user_operator_baker(
            {
                "user": user,
                "operator": operator,
                "status": UserOperator.Statuses.APPROVED,
                "role": UserOperator.Roles.ADMIN,
            }
        )
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            UserService.get_if_authorized(user.pk, target_user.pk)
