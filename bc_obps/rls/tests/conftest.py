import pytest
from rls.utils.manager import RlsManager


@pytest.fixture(scope='session')
def django_db_setup(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        RlsManager.re_apply_rls()
