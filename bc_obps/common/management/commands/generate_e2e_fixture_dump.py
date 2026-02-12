import os
import subprocess  # nosec B404
import urllib.parse
from datetime import date

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connection
from common.management.commands.truncate_dev_data_tables import TABLES_WITH_PRODUCTION_DATA, SCHEMAS

OUTPUT_PATH = os.path.join(settings.BASE_DIR, 'common', 'fixtures', 'e2e', 'e2e_fixture_dump.sql')
DATE_PREFIX = "-- Generated on: "


class Command(BaseCommand):
    help = 'Generate SQL dump of e2e fixture data.'

    def handle(self, *args, **options):
        self._load_fixtures()
        raw_sql = self._run_pg_dump()
        cleaned_sql = self._clean_pg_dump_output(raw_sql)
        self._write_dump_file(cleaned_sql)
        self.stdout.write(self.style.SUCCESS(f"SQL dump written to {OUTPUT_PATH}"))

    def _load_fixtures(self):
        self.stdout.write("Step 1/3: Truncating dev data tables...")
        call_command('truncate_dev_data_tables')
        self.stdout.write("Step 2/3: Loading fixtures via Django ORM...")
        call_command('load_fixtures')
        call_command('load_reporting_fixtures')

    def _run_pg_dump(self):
        """Snapshot the current DB state as raw SQL using pg_dump."""
        self.stdout.write("Step 3/3: Dumping fixture data with pg_dump...")

        db = settings.DATABASES['default']
        password = urllib.parse.quote(db.get('PASSWORD', ''), safe='')
        db_url = (
            f"postgres://{db.get('USER', 'postgres')}:{password}"
            f"@{db.get('HOST', 'localhost')}:{db.get('PORT', 5432)}/{db['NAME']}"
        )

        cmd = [
            'pg_dump',
            '--data-only',
            '--inserts',
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

        result = subprocess.run(cmd, capture_output=True, text=True)  # nosec B603
        if result.returncode != 0:
            raise RuntimeError(f"pg_dump failed: {result.stderr}")
        return result.stdout

    @staticmethod
    def _clean_pg_dump_output(raw_output):
        """Remove pg_dump comment lines and collapse consecutive blank lines."""
        lines = [line for line in raw_output.splitlines() if not line.startswith("--")]
        return "\n".join(line for i, line in enumerate(lines) if line.strip() or (i > 0 and lines[i - 1].strip()))

    def _write_dump_file(self, pg_dump_sql):
        """Assemble and write the final dump: header + truncate + data."""
        header = (
            f"{DATE_PREFIX}{date.today().isoformat()}\n"
            "-- Auto-generated e2e fixture dump. Do not edit manually.\n"
            "-- Regenerate with: python manage.py generate_e2e_fixture_dump\n\n"
        )
        truncate_sql = self._build_truncate_sql()

        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, 'w') as f:
            f.write(header)
            f.write(truncate_sql)
            f.write(pg_dump_sql)

    @staticmethod
    def _build_truncate_sql():
        """Build a TRUNCATE statement for all fixture (non-production) tables."""
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

        if not tables:
            return ""
        return f"TRUNCATE TABLE {', '.join(tables)} RESTART IDENTITY CASCADE;\n\n"
