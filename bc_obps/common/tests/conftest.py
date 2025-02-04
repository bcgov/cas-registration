import pytest
from django.db import connection
from common.tests.utils.helpers import set_db_user_guid_for_tests
from rls.utils.manager import RlsManager

@pytest.fixture(scope='session', autouse=True)
def django_db_setup(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        RlsManager.re_apply_rls()
        set_db_user_guid_for_tests(connection.cursor())
