import pytest
from common.tests.utils.helpers import set_db_user_guid_for_tests
from rls.utils.manager import RlsManager


@pytest.fixture(scope='class', autouse=True)
def django_db_setup(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        RlsManager.re_apply_rls()
        set_db_user_guid_for_tests()


@pytest.fixture(autouse=True)
def modify_settings(settings):
    # Remove silk and django_extensions from installed apps and middleware during tests
    settings.INSTALLED_APPS = [app for app in settings.INSTALLED_APPS if app not in ['silk', 'django_extensions']]
    settings.MIDDLEWARE = [mw for mw in settings.MIDDLEWARE if mw != 'silk.middleware.SilkyMiddleware']
