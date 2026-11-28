from unittest.mock import patch

import pytest
from model_bakery import baker
from registration.models import AppRole, User
from registration.service.data_types.user_profile_service import UserLoginSyncData
from registration.service.user_profile_service import UserProfileService

pytestmark = pytest.mark.django_db


def make_user(role_name: str = "industry_user") -> User:
    return baker.make(
        User,
        app_role=AppRole.objects.get(role_name=role_name),
        email="old.email@email.com",
        bceid_business_name="Old Business Name",
    )


class TestSyncUserProfileFromIdp:
    @staticmethod
    def test_updates_changed_fields():
        user = make_user()

        result = UserProfileService.sync_user_profile_from_idp(
            user.user_guid,
            UserLoginSyncData(
                email="new.email@email.com", bceid_business_name="New Business Name"
            ),
        )

        user.refresh_from_db()
        assert result.email == user.email == "new.email@email.com"
        assert (
            result.bceid_business_name
            == user.bceid_business_name
            == "New Business Name"
        )

    @staticmethod
    def test_updates_only_the_field_that_changed():
        user = make_user()

        UserProfileService.sync_user_profile_from_idp(
            user.user_guid,
            UserLoginSyncData(
                email="new.email@email.com", bceid_business_name="Old Business Name"
            ),
        )

        user.refresh_from_db()
        assert user.email == "new.email@email.com"
        assert user.bceid_business_name == "Old Business Name"

    @staticmethod
    def test_no_changes_does_not_save():
        user = make_user()

        with patch.object(User, "save", autospec=True) as mock_save:
            UserProfileService.sync_user_profile_from_idp(
                user.user_guid,
                UserLoginSyncData(
                    email="old.email@email.com", bceid_business_name="Old Business Name"
                ),
            )

        mock_save.assert_not_called()

    @staticmethod
    def test_internal_users_are_not_updated():
        user = make_user("cas_analyst")

        UserProfileService.sync_user_profile_from_idp(
            user.user_guid,
            UserLoginSyncData(
                email="new.email@email.com", bceid_business_name="New Business Name"
            ),
        )

        user.refresh_from_db()
        assert user.email == "old.email@email.com"
        assert user.bceid_business_name == "Old Business Name"
