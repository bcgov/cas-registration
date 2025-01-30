import pytest
from django.db import connection
from common.tests.utils.helpers import set_db_user_guid_for_tests


@pytest.fixture(scope="session", autouse=True)
def django_db_setup(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        with connection.cursor() as cursor:
            set_db_user_guid_for_tests(cursor)
