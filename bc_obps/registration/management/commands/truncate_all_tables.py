from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Truncate all tables in the database'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname in 'erc, erc_history';")
            for row in cursor.fetchall():
                table_name = row[0]
                # Use Django's query building to create a safe parameterized query
                cursor.execute('TRUNCATE TABLE erc."{}" RESTART IDENTITY CASCADE;'.format(table_name))
        self.stdout.write(self.style.SUCCESS('All tables have been truncated.'))
