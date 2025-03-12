import os
import re
from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.apps import apps
from rls.utils.manager import RlsManager
from registration.models import Operation


class Command(BaseCommand):
    help = (
        "Run default migrations for all apps except specified exclusions in production. "
        "Runs additional custom migrations for specific apps if required."
    )

    # List of apps to exclude from default migrations in production
    apps_to_not_include_in_prod = settings.APPS_TO_NOT_INCLUDE_IN_PROD

    def handle(self, *args, **options):
        environment = os.environ.get('ENVIRONMENT')
        if environment != 'prod':
            self.stdout.write('Running default migrate command for all apps...')
            call_command('migrate')
            RlsManager.re_apply_rls()

            if Operation.objects.exists():
                self.stdout.write(self.style.WARNING("Skipping fixture load: Data already exists."))
                return

            if environment == 'test':
                call_command("pgtrigger", "disable", "--schema", "erc")
                call_command('load_test_data')
                call_command("pgtrigger", "enable", "--schema", "erc")
            if environment == 'dev' and os.environ.get('CI') != 'true':
                call_command("pgtrigger", "disable", "--schema", "erc")
                call_command('load_fixtures')
                call_command('load_reporting_fixtures')
                call_command("pgtrigger", "enable", "--schema", "erc")
            return

        # Run the default migrate command for all apps except the ones in apps_to_not_include_in_prod
        self.stdout.write('Running default migrate command for all apps except specified exclusions...')

        # Get all installed apps
        all_apps_labels = [app.label for app in apps.get_app_configs()]
        apps_to_run_default_migrate = [
            app_label for app_label in all_apps_labels if app_label not in self.apps_to_not_include_in_prod
        ]

        # Run migrate for each app except the ones in apps_to_not_include_in_prod
        for app_label in apps_to_run_default_migrate:
            self.stdout.write(f'Running migrations for {app_label}...')
            # Wrap in try/except block to handle errors for apps with no migrations and continue with other apps
            try:
                call_command('migrate', app_label=app_label)
                self.stdout.write(self.style.SUCCESS(f'Successfully migrated {app_label}.'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error migrating {app_label}: {e}'))
                # Some apps like messages and staticfiles do not have migrations so we can ignore them
                if "does not have migrations" in str(e):
                    continue
                else:
                    raise e

        self.stdout.write(self.style.SUCCESS('Default migrations completed.'))
        self.stdout.write(self.style.WARNING('Running custom migrations for specific apps...'))
        # Run migrations
        for app_label in self.apps_to_not_include_in_prod:
            self.stdout.write(f'Running custom migrations for {app_label}...')
            self.migrate_app_to_latest_migration_flag(app_label)

        RlsManager.re_apply_rls()

    def migrate_app_to_latest_migration_flag(self, app_label):
        """
        Run migrations for a specific app up to the latest migration file.

        Args:
            app_label (str): The label of the app to migrate.
        """
        migration_dir = self.get_migration_directory(app_label)
        if not migration_dir:
            self.stdout.write(self.style.WARNING(f'No migrations directory found for {app_label}'))
            return

        migration_files = self.get_migration_files(migration_dir)
        if not migration_files:
            self.stdout.write(self.style.WARNING(f'No migration files found for {app_label}'))
            return

        latest_migration = self.get_latest_migration_file(migration_files)
        latest_migration_name = os.path.splitext(latest_migration)[0]

        self.stdout.write(f'Running custom migrations for {app_label} up to {latest_migration_name}')
        call_command('migrate', app_label, latest_migration_name)
        self.stdout.write(self.style.SUCCESS(f'Successfully migrated {app_label} to {latest_migration_name}'))

    @staticmethod
    def get_migration_directory(app_label):
        """
        Get the path to the migrations directory for a given app.

        Args:
            app_label (str): The label of the app.

        Returns:
            str: The path to the migrations directory.
        """
        app_config = apps.get_app_config(app_label)
        return os.path.join(app_config.path, 'migrations')

    @staticmethod
    def get_migration_files(migration_dir):
        """
        Get a list of migration files in the specified directory that match the required format.

        Args:
            migration_dir (str): The path to the migrations directory.

        Returns:
            list: A list of migration file names.
        """
        return [f for f in os.listdir(migration_dir) if re.match(r'^\d{4}_V\d+_\d+_\d+\.py$', f) and f != '__init__.py']

    @staticmethod
    def get_latest_migration_file(migration_files):
        """
        Determine the latest migration file based on the numeric parts in the filename.

        Args:
            migration_files (list): A list of migration file names.

        Returns:
            str: The name of the latest migration file.
        """
        migration_files.sort(key=lambda x: tuple(map(int, re.findall(r'\d+', x))))
        return migration_files[-1]
