import os
import subprocess  # nosec B404
import urllib.parse
from datetime import date
from django.conf import settings
from django.core.management import call_command
from django.db import connection
from django.http import HttpRequest, HttpResponse
from django.core.cache import cache
from registration.constants import MISC_TAGS
from registration.api.router import router
from common.management.commands.generate_e2e_fixture_dump import OUTPUT_PATH, DATE_FILE_PATH
from common.management.commands.truncate_dev_data_tables import TABLES_WITH_PRODUCTION_DATA, SCHEMAS


def _dump_is_stale() -> bool:
    """Return True if the dump or its date file is missing, or was not generated today."""
    if not os.path.exists(OUTPUT_PATH) or not os.path.exists(DATE_FILE_PATH):
        return True
    with open(DATE_FILE_PATH, 'r') as f:
        dump_date = f.read().strip()
    return dump_date != date.today().isoformat()


def _truncate_fixture_tables() -> None:
    """Truncate all non-production tables before restoring the dump."""
    tables = []
    with connection.cursor() as cursor:
        for schema in SCHEMAS:
            cursor.execute(
                "SELECT tablename FROM pg_tables WHERE schemaname = %s ORDER BY tablename;",
                [schema],
            )
            for (tablename,) in cursor.fetchall():
                if tablename not in TABLES_WITH_PRODUCTION_DATA:
                    tables.append(f"{schema}.{tablename}")
        if tables:
            cursor.execute(f"TRUNCATE TABLE {', '.join(tables)} RESTART IDENTITY CASCADE;")


def _run_pg_restore() -> None:
    """Restore the custom-format dump using pg_restore."""
    db = settings.DATABASES['default']
    password = urllib.parse.quote(db.get('PASSWORD', ''), safe='')
    db_url = (
        f"postgres://{db.get('USER', 'postgres')}:{password}"
        f"@{db.get('HOST', 'localhost')}:{db.get('PORT', 5432)}/{db['NAME']}"
    )

    cmd = [
        'pg_restore',
        '--data-only',
        '--no-owner',
        '--no-privileges',
        '--disable-triggers',
        f'--dbname={db_url}',
        OUTPUT_PATH,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)  # nosec B603
    if result.returncode != 0:
        raise RuntimeError(f"pg_restore failed: {result.stderr}")


# testing endpoint
@router.get(
    "/test-setup",
    tags=MISC_TAGS,
    description="""Resets the test database by restoring a pre-generated pg_dump.
    If the dump file is missing or stale, it is regenerated automatically.
    This endpoint is only available in the local/CI environments.""",
)
def setup(request: HttpRequest) -> HttpResponse:
    if settings.CI == 'true' or settings.ENVIRONMENT == 'local':
        cache.clear()  # clear cache to avoid stale data (specifically for the current_user_middleware.py middleware)
        try:
            if _dump_is_stale():
                call_command('generate_e2e_fixture_dump')
            _truncate_fixture_tables()
            _run_pg_restore()
            return HttpResponse("Test setup complete.", status=200)
        except Exception as e:
            return HttpResponse(f"Test setup failed. Reason:{e}", status=500)
    else:
        return HttpResponse("This endpoint only exists in the local/CI environments.", status=404)
