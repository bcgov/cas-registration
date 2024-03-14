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
        schemas = ["erc", "erc_history"]
        for schema in schemas:
            with connection.cursor() as cursor:
                cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname = %s;", [schema])
                for row in cursor.fetchall():
                    table_name = schema + "." + row[0]
                    if table_name not in tables_with_production_data:
                        cursor.execute('TRUNCATE TABLE ' + table_name + ' RESTART IDENTITY CASCADE;')

        self.stdout.write(self.style.SUCCESS('All tables have been truncated.'))
