import logging
import traceback

from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.management import call_command
from rls.utils.manager import RlsManager
from registration.models import Operation
from django.db.migrations.loader import MigrationLoader
from django.db import connections

logger = logging.getLogger(__name__)


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

    def _load_fixtures_with_triggers_disabled(self, fixture_commands):
        """
        Disables pgtrigger triggers on the 'erc' schema, runs the given fixture
        loading commands, and guarantees triggers are re-enabled even if a command fails.
        """
        self.stdout.write(self.style.NOTICE("Disabling pgtrigger triggers on 'erc' schema for fixture loading..."))
        call_command("pgtrigger", "disable", "--schema", "erc")
        try:
            for command_name in fixture_commands:
                self.stdout.write(self.style.NOTICE(f"Running '{command_name}'..."))
                call_command(command_name)
        except Exception as e:
            logger.error(
                "Fixture loading failed during '%s'. Triggers will be re-enabled.\n" "Error: %s\n" "Traceback:\n%s",
                command_name,
                e,
                traceback.format_exc(),
            )
            raise
        finally:
            self.stdout.write(self.style.NOTICE("Re-enabling pgtrigger triggers on 'erc' schema..."))
            call_command("pgtrigger", "enable", "--schema", "erc")
            self.stdout.write(self.style.SUCCESS("pgtrigger triggers re-enabled successfully."))

    def load_env_specific_fixtures(self, environment):
        if Operation.objects.exists():
            self.stdout.write(self.style.WARNING("Skipping fixture load: Data already exists."))
            return

        if environment == 'local':
            call_command('load_fixtures')
            call_command('load_reporting_fixtures')
        elif environment == 'dev' and settings.CI != 'true':
            self._load_fixtures_with_triggers_disabled(['load_fixtures', 'load_reporting_fixtures'])
        elif environment == 'test':
            self._load_fixtures_with_triggers_disabled(['load_test_data', 'load_reporting_test_data'])
