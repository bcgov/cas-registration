from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Truncate all tables in the database'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'erc';")
            for row in cursor.fetchall():
                table_name = row[0]
                cursor.execute(f'TRUNCATE TABLE erc."{table_name}" RESTART IDENTITY CASCADE;')
        self.stdout.write(self.style.SUCCESS('All tables have been truncated.'))
