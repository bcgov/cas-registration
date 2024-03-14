# @SuppressWarnings("all")
# Suppressing all warnings in this file because it is a management command that is not intended to be used in production
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    def handle(self, *args, **options):
        tables_with_production_data = [
            "app_role",
            "business_role",
            "business_structure",
            "document_type",
            "naics_code",
            "regulated_product",
            "reporting_activity",
            "user",  # This table has some seeded data (for e2e tests) that should not be truncated
        ]
        with connection.cursor() as cursor:
            # Truncate tables in 'erc' schema
            cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'erc';")
            for row in cursor.fetchall():
                table_name = row[0]
                if table_name not in tables_with_production_data:
                    cursor.execute('TRUNCATE TABLE erc."{}" RESTART IDENTITY CASCADE;'.format(table_name))

            # Truncate tables in 'erc_history' schema
            cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'erc_history';")
            for row in cursor.fetchall():
                table_name = row[0]
                cursor.execute('TRUNCATE TABLE erc_history."{}" RESTART IDENTITY CASCADE;'.format(table_name))

        self.stdout.write(self.style.SUCCESS('All tables have been truncated.'))
