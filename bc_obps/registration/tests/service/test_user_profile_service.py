from unittest.mock import patch
import pytest
from model_bakery import baker
from registration.models import AppRole, User, UserOperator
from registration.schema import UserLoginSyncIn
from registration.service.data_access_service.contact_service import ContactDataAccessService
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
            user.user_guid, UserLoginSyncIn(email="new.email@email.com", bceid_business_name="New Business Name")
        )

        user.refresh_from_db()
        assert result.email == user.email == "new.email@email.com"
        assert result.bceid_business_name == user.bceid_business_name == "New Business Name"

    @staticmethod
    def test_updates_only_the_field_that_changed():
        user = make_user()

        UserProfileService.sync_user_profile_from_idp(
            user.user_guid, UserLoginSyncIn(email="new.email@email.com", bceid_business_name="Old Business Name")
        )

        user.refresh_from_db()
        assert user.email == "new.email@email.com"
        assert user.bceid_business_name == "Old Business Name"

    @staticmethod
    def test_no_changes_does_not_save():
        user = make_user()

        with patch.object(User, "save", autospec=True) as mock_save:
            UserProfileService.sync_user_profile_from_idp(
                user.user_guid, UserLoginSyncIn(email="old.email@email.com", bceid_business_name="Old Business Name")
            )

        mock_save.assert_not_called()

    @staticmethod
    def test_blank_values_do_not_overwrite_stored_values():
        user = make_user()

        with patch.object(User, "save", autospec=True) as mock_save:
            UserProfileService.sync_user_profile_from_idp(
                user.user_guid, UserLoginSyncIn(email="", bceid_business_name="   ")
            )

        mock_save.assert_not_called()
        user.refresh_from_db()
        assert user.email == "old.email@email.com"
        assert user.bceid_business_name == "Old Business Name"

    @staticmethod
    def test_internal_users_are_not_updated():
        user = make_user("cas_analyst")

        UserProfileService.sync_user_profile_from_idp(
            user.user_guid, UserLoginSyncIn(email="new.email@email.com", bceid_business_name="New Business Name")
        )

        user.refresh_from_db()
        assert user.email == "old.email@email.com"
        assert user.bceid_business_name == "Old Business Name"


class TestSyncUserProfileContactEmail:
    @staticmethod
    def _make_user_with_operator(status=UserOperator.Statuses.APPROVED):
        user = make_user()
        user_operator = baker.make_recipe("registration.tests.utils.approved_user_operator", user=user, status=status)
        return user, user_operator.operator

    @staticmethod
    def _sync_email(user, email="new.email@email.com"):
        UserProfileService.sync_user_profile_from_idp(
            user.user_guid, UserLoginSyncIn(email=email, bceid_business_name=user.bceid_business_name)
        )

    def test_updates_contact_that_still_uses_the_old_login_email(self):
        user, operator = self._make_user_with_operator()
        contact = baker.make_recipe("registration.tests.utils.contact", operator=operator, email=user.email)

        self._sync_email(user)

        contact.refresh_from_db()
        assert contact.email == "new.email@email.com"

    def test_does_not_update_contact_with_a_custom_email(self):
        user, operator = self._make_user_with_operator()
        contact = baker.make_recipe("registration.tests.utils.contact", operator=operator, email="custom@email.com")

        self._sync_email(user)

        contact.refresh_from_db()
        assert contact.email == "custom@email.com"

    def test_does_not_update_contact_when_new_email_is_already_used_by_another_contact(self):
        # active contacts must have a unique email per operator (unique_active_email_per_operator)
        user, operator = self._make_user_with_operator()
        contact = baker.make_recipe("registration.tests.utils.contact", operator=operator, email=user.email)
        other_contact = baker.make_recipe(
            "registration.tests.utils.contact", operator=operator, email="new.email@email.com"
        )

        self._sync_email(user)

        user.refresh_from_db()
        contact.refresh_from_db()
        other_contact.refresh_from_db()
        assert user.email == "new.email@email.com"  # the user sync itself still succeeds
        assert contact.email == "old.email@email.com"
        assert other_contact.email == "new.email@email.com"

    def test_does_not_update_contacts_of_other_operators(self):
        user, _ = self._make_user_with_operator()
        other_contact = baker.make_recipe("registration.tests.utils.contact", email=user.email)

        self._sync_email(user)

        other_contact.refresh_from_db()
        assert other_contact.email == "old.email@email.com"

    def test_business_name_only_change_does_not_touch_contacts(self):
        user, operator = self._make_user_with_operator()
        baker.make_recipe("registration.tests.utils.contact", operator=operator, email=user.email)

        with patch.object(ContactDataAccessService, "update_user_contact_email") as mock_contact_sync:
            UserProfileService.sync_user_profile_from_idp(
                user.user_guid, UserLoginSyncIn(email=user.email, bceid_business_name="New Business Name")
            )

        mock_contact_sync.assert_not_called()
