import os
import subprocess  # nosec B404
import urllib.parse
from datetime import date

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from common.management.commands.truncate_dev_data_tables import TABLES_WITH_PRODUCTION_DATA, SCHEMAS

OUTPUT_PATH = os.path.join(settings.BASE_DIR, 'common', 'fixtures', 'e2e', 'e2e_fixture_dump.dump')
DATE_FILE_PATH = os.path.join(settings.BASE_DIR, 'common', 'fixtures', 'e2e', 'e2e_fixture_dump.date')


class Command(BaseCommand):
    help = 'Generate a pg_dump of e2e fixture data in custom format.'

    def handle(self, *args, **options):
        self._load_fixtures()
        self._run_pg_dump()
        self._write_date_file()
        self.stdout.write(self.style.SUCCESS(f"Dump written to {OUTPUT_PATH}"))

    def _load_fixtures(self):
        self.stdout.write("Step 1/3: Truncating dev data tables...")
        call_command('truncate_dev_data_tables')
        self.stdout.write("Step 2/3: Loading fixtures via Django ORM...")
        call_command('load_fixtures')
        call_command('load_reporting_fixtures')

    def _run_pg_dump(self):
        """Snapshot the current DB state as a custom-format dump."""
        self.stdout.write("Step 3/3: Dumping fixture data with pg_dump...")

        db = settings.DATABASES['default']
        password = urllib.parse.quote(db.get('PASSWORD', ''), safe='')
        db_url = (
            f"postgres://{db.get('USER', 'postgres')}:{password}"
            f"@{db.get('HOST', 'localhost')}:{db.get('PORT', 5432)}/{db['NAME']}"
        )

        cmd = [
            'pg_dump',
            '--format=custom',
            '--data-only',
            '--no-owner',
            '--no-privileges',
            '--no-comments',
        ]
        for schema in SCHEMAS:
            cmd += ['--schema', schema]
        for table in TABLES_WITH_PRODUCTION_DATA:
            for schema in SCHEMAS:
                cmd += ['--exclude-table-data', f'{schema}.{table}']
                cmd += ['--exclude-table-data', f'{schema}.{table}_history']
        cmd.append(db_url)

        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, 'wb') as f:
            result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=False)  # nosec B603
        if result.returncode != 0:
            raise RuntimeError(f"pg_dump failed: {result.stderr.decode()}")

    @staticmethod
    def _write_date_file():
        """Write today's date to a companion file for staleness checks."""
        with open(DATE_FILE_PATH, 'w') as f:
            f.write(date.today().isoformat())
