import pytest
from model_bakery import baker
from django.utils import timezone
from service.data_access_service.user_service import UserDataAccessService

pytestmark = pytest.mark.django_db


class TestDataAccessUserService:
    @staticmethod
    def test_get_by_guid():
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')

        assert UserDataAccessService.get_by_guid(cas_admin.user_guid).email == cas_admin.email

    @staticmethod
    def test_get_by_guid_skip_archived():
        # archiving user
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        # archived internal user
        archived_user = baker.make_recipe(
            'registration.tests.utils.cas_director', archived_at=timezone.now(), archived_by=cas_admin
        )

        with pytest.raises(BaseException, match='User matching query does not exist.'):
            UserDataAccessService.get_by_guid(archived_user.user_guid)

    @staticmethod
    def test_get_by_guid_include_archived():
        # archiving user
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        # archived internal user
        archived_user = baker.make_recipe(
            'registration.tests.utils.cas_director', archived_at=timezone.now(), archived_by=cas_admin
        )
        assert UserDataAccessService.get_by_guid(archived_user.user_guid, True).email == archived_user.email

    @staticmethod
    def test_get_internal_users_including_archived():

        # internal user
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        # archived internal user
        baker.make_recipe('registration.tests.utils.cas_director', archived_at=timezone.now(), archived_by=cas_admin)
        # external user - should not be included in results
        baker.make_recipe('registration.tests.utils.industry_operator_user')
        # archived external user - should not be included in results
        baker.make_recipe(
            'registration.tests.utils.industry_operator_user', archived_at=timezone.now(), archived_by=cas_admin
        )

        assert UserDataAccessService.get_internal_users_including_archived().count() == 2
