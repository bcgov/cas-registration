import os
import pgtrigger
from django.conf import settings
from django.db import connection
from django.http import HttpRequest, HttpResponse
from django.core.cache import cache
from registration.constants import MISC_TAGS
from registration.api.router import router
from rls.utils.manager import RlsManager

FIXTURE_DUMP_PATH = os.path.join(settings.BASE_DIR, 'common', 'fixtures', 'e2e', 'e2e_fixture_dump.sql')


# testing endpoint
@router.get(
    "/test-setup",
    tags=MISC_TAGS,
    description="""Resets the test database by executing a pre-generated SQL dump.
    This endpoint is only available in the local/CI environments.""",
)
def setup(request: HttpRequest) -> HttpResponse:
    if settings.CI == 'true' or settings.ENVIRONMENT == 'local':
        cache.clear()  # clear cache to avoid stale data (specifically for the current_user_middleware.py middleware)
        try:
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
