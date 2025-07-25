import pytest
from django.utils import timezone
from registration.models.app_role import AppRole
from registration.schema.user import UserUpdateRoleIn
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
    def test_get_user_if_authorized_cas_user_pending_fail():
        admin_user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_pending"))
        target_user = user_baker()
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            UserService.get_if_authorized(admin_user.pk, target_user.pk)

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

    @staticmethod
    def test_update_user_role_fail():
        updating_user = baker.make_recipe('registration.tests.utils.cas_admin')
        user_to_update = updating_user
        with pytest.raises(Exception, match='You cannot change your own user role.'):
            UserService.update_user_role(
                updating_user.user_guid,
                user_to_update.user_guid,
                UserUpdateRoleIn(app_role='cas_director', archive=False),
            )

    @staticmethod
    def test_update_user_role_change_success():
        updating_user = baker.make_recipe('registration.tests.utils.cas_admin')
        user_to_update = baker.make_recipe('registration.tests.utils.cas_pending')

        UserService.update_user_role(
            updating_user.user_guid, user_to_update.user_guid, UserUpdateRoleIn(app_role='cas_director', archive=False)
        )

        user_to_update.refresh_from_db()
        assert user_to_update.app_role.role_name == 'cas_director'
        assert user_to_update.archived_at is None
        assert user_to_update.archived_by is None

    @staticmethod
    def test_update_user_role_archive_success():
        updating_user = baker.make_recipe('registration.tests.utils.cas_admin')
        user_to_update = baker.make_recipe('registration.tests.utils.cas_analyst')

        UserService.update_user_role(
            updating_user.user_guid, user_to_update.user_guid, UserUpdateRoleIn(app_role='cas_pending', archive=True)
        )

        user_to_update.refresh_from_db()
        assert user_to_update.app_role.role_name == 'cas_pending'
        assert user_to_update.archived_at is not None
        assert user_to_update.archived_by == updating_user

    @staticmethod
    def test_update_user_role_unarchive_success():
        updating_user = baker.make_recipe('registration.tests.utils.cas_admin')
        user_to_update = baker.make_recipe('registration.tests.utils.cas_pending', archived_at=timezone.now())

        UserService.update_user_role(
            updating_user.user_guid,
            user_to_update.user_guid,
            UserUpdateRoleIn(app_role='cas_analyst', archive=False),
            True,
        )

        user_to_update.refresh_from_db()
        assert user_to_update.app_role.role_name == 'cas_analyst'
        assert user_to_update.archived_at is None
        assert user_to_update.archived_by is None
