from django.core.management.base import BaseCommand
from django.db import connection
from django.apps import apps
from psycopg.sql import SQL, Literal, Identifier


class Command(BaseCommand):
    help = "Initialize roles or reverse them"

    def add_arguments(self, parser):
        parser.add_argument(
            '--reverse',
            action='store_true',  # Boolean flag (default: False)
            help="Reverse the role initialization process",
        )

    def handle(self, *args, **options):
        reverse = options['reverse']
        AppRole = apps.get_model("registration", "AppRole")
        roles = list(AppRole.objects.values_list("role_name", flat=True))

        with connection.cursor() as cursor:
            if reverse:
                self.reverse_init_roles(cursor, roles)
            else:
                self.init_roles(cursor, roles)

    def init_roles(self, cursor, roles):
        for role in roles:
            # Use Identifier for SQL object names (e.g., tables, columns, roles).
            # Use Literal for actual values (e.g., strings, numbers in WHERE clauses).
            existing_role_query = SQL("select 1 from pg_roles where rolname = {}").format(Literal(role))
            cursor.execute(existing_role_query)
            if not cursor.fetchone():
                # Placeholders (%s) in SQL are designed to safely substitute values like strings or numbers.
                # However, they cannot be used to substitute SQL identifiers (e.g., role names, table names),
                # as these are part of the SQL syntax itself.
                create_role_query = SQL("create role {}").format(Identifier(role))
                cursor.execute(create_role_query)
                erc_grant_usage_query = SQL("grant usage on schema erc to {}").format(Identifier(role))
                cursor.execute(erc_grant_usage_query)
                self.stdout.write(self.style.SUCCESS(f"Role {role} created successfully."))
            else:
                self.stdout.write(self.style.WARNING(f"Role {role} already exists."))

    def reverse_init_roles(self, cursor, roles):
        for role in roles:
            query = SQL("select 1 from pg_roles where rolname = {}").format(Literal(role))
            cursor.execute(query)
            if cursor.fetchone():
                revoke_usage_query = SQL("revoke usage on schema erc from {}").format(Identifier(role))
                drop_role_query = SQL("drop role {}").format(Identifier(role))
                cursor.execute(revoke_usage_query)
                cursor.execute(drop_role_query)
                self.stdout.write(self.style.SUCCESS(f"Role {role} dropped successfully."))
            else:
                self.stdout.write(self.style.WARNING(f"Role {role} does not exist."))
