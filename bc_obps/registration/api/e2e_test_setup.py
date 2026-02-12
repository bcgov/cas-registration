import os
import pgtrigger
from datetime import date
from django.conf import settings
from django.core.management import call_command
from django.db import connection
from django.http import HttpRequest, HttpResponse
from django.core.cache import cache
from registration.constants import MISC_TAGS
from registration.api.router import router
from rls.utils.manager import RlsManager
from common.management.commands.generate_e2e_fixture_dump import DATE_PREFIX

FIXTURE_DUMP_PATH = os.path.join(settings.BASE_DIR, 'common', 'fixtures', 'e2e', 'e2e_fixture_dump.sql')


def _dump_is_stale() -> bool:
    """Return True if the dump file is missing or was not generated today."""
    if not os.path.exists(FIXTURE_DUMP_PATH):
        return True
    with open(FIXTURE_DUMP_PATH, 'r') as f:
        first_line = f.readline()
    if not first_line.startswith(DATE_PREFIX):
        return True
    dump_date = first_line[len(DATE_PREFIX) :].strip()
    return dump_date != date.today().isoformat()


# testing endpoint
@router.get(
    "/test-setup",
    tags=MISC_TAGS,
    description="""Resets the test database by executing a pre-generated SQL dump.
    If the dump file is missing or stale, it is regenerated automatically.
    This endpoint is only available in the local/CI environments.""",
)
def setup(request: HttpRequest) -> HttpResponse:
    if settings.CI == 'true' or settings.ENVIRONMENT == 'local':
        cache.clear()  # clear cache to avoid stale data (specifically for the current_user_middleware.py middleware)
        try:
            if settings.ENVIRONMENT == 'local' and _dump_is_stale():
                call_command('generate_e2e_fixture_dump')
            with RlsManager.bypass_rls(), pgtrigger.ignore():
                with open(FIXTURE_DUMP_PATH, 'r') as f:
                    sql = f.read()
                with connection.cursor() as cursor:
                    cursor.execute(sql)
                return HttpResponse("Test setup complete.", status=200)
        except Exception as e:
            return HttpResponse(f"Test setup failed. Reason:{e}", status=500)
    else:
        return HttpResponse("This endpoint only exists in the local/CI environments.", status=404)
