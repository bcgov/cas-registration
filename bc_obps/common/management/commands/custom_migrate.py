from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.management import call_command
from rls.utils.manager import RlsManager
from registration.models import Operation
from django.db.migrations.loader import MigrationLoader
from django.db import connections


def has_unapplied_migrations(connection_alias='default'):
    # Initialize the MigrationLoader with the database connection
    loader = MigrationLoader(connections[connection_alias])

    # Load migration information from disk
    loader.load_disk()  # Loads migrations from disk

    # Get all migrations (on disk) and applied migrations (from database)
    all_migrations = loader.disk_migrations  # Dict of migrations on disk
    applied_migrations = loader.applied_migrations  # Set of applied migrations

    # Check for unapplied migrations
    for migration_key in all_migrations:
        if migration_key not in applied_migrations:
            return True
    return False


class Command(BaseCommand):
    help = "Same as the default migrate command to apply RLS policies and load environment-specific fixtures."

    def handle(self, *args, **options):
        environment = settings.ENVIRONMENT

        has_migrations = has_unapplied_migrations()
        call_command('migrate')
        if has_migrations:
            print('Applying RLS Operations')
            RlsManager.re_apply_rls()
        else:
            print('Skipping RLS Operations')

        if environment != 'prod':
            self.load_env_specific_fixtures(environment)

    def load_env_specific_fixtures(self, environment):
        if Operation.objects.exists():
            self.stdout.write(self.style.WARNING("Skipping fixture load: Data already exists."))
            return

        if environment == 'local':
            call_command('load_fixtures')
            call_command('load_reporting_fixtures')
        elif environment == 'dev' and settings.CI != 'true':
            call_command("pgtrigger", "disable", "--schema", "erc")
            call_command('load_fixtures')
            call_command('load_reporting_fixtures')
            call_command("pgtrigger", "enable", "--schema", "erc")
        elif environment == 'test':
            call_command("pgtrigger", "disable", "--schema", "erc")
            call_command('load_test_data')
            call_command('load_reporting_test_data')
            call_command("pgtrigger", "enable", "--schema", "erc")
