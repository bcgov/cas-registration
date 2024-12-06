import os
import re
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.apps import apps
from django.db import connection
from rls.utils import RlsRoles


class Command(BaseCommand):
    help = 'Run default migrations for all apps except reporting, then run custom migrations for reporting app'

    def handle(self, *args, **options):
        # Only running the custom command in the test and production environments
        # Otherwise, run the default migrate command for all apps
        if os.environ.get('ENVIRONMENT') not in ['test', 'prod']:
            self.stdout.write('Running default migrate command for all apps...')
            call_command('migrate')
            return
        # Run the default migrate command for all apps except the reporting app
        self.stdout.write('Running default migrations for all apps except reporting...')

        # Get all installed apps
        all_apps = [app.label for app in apps.get_app_configs()]
        apps_to_run_default_migrate = [app for app in all_apps if app != 'reporting']

        # Run migrate for each app except reporting
        for app_label in apps_to_run_default_migrate:
            self.stdout.write(f'Running migrations for {app_label}...')
            # Wrap in try/except block to handle errors for apps with no migrations and continue with other apps
            try:
                call_command('migrate', app_label=app_label)
                self.stdout.write(self.style.SUCCESS(f'Successfully migrated {app_label}.'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error migrating {app_label}: {e}'))
                continue

        self.stdout.write(self.style.SUCCESS('Default migrations completed.'))

        # Run custom migrations for the reporting app
        self.migrate_app_to_latest('reporting')

    def migrate_app_to_latest(self, app_label):
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

    def get_migration_directory(self, app_label):
        """
        Get the path to the migrations directory for a given app.

        Args:
            app_label (str): The label of the app.

        Returns:
            str: The path to the migrations directory.
        """
        app_config = apps.get_app_config(app_label)
        return os.path.join(app_config.path, 'migrations')

    def get_migration_files(self, migration_dir):
        """
        Get a list of migration files in the specified directory that match the required format.

        Args:
            migration_dir (str): The path to the migrations directory.

        Returns:
            list: A list of migration file names.
        """
        return [f for f in os.listdir(migration_dir) if re.match(r'^\d{4}_V\d+_\d+_\d+\.py$', f) and f != '__init__.py']

    def get_latest_migration_file(self, migration_files):
        """
        Determine the latest migration file based on the numeric parts in the filename.

        Args:
            migration_files (list): A list of migration file names.

        Returns:
            str: The name of the latest migration file.
        """
        migration_files.sort(key=lambda x: tuple(map(int, re.findall(r'\d+', x))))
        return migration_files[-1]

    def revoke_all_privileges(self):
        with connection.cursor() as cursor:
            cursor.execute(f'drop owned by {RlsRoles.ALL_ROLES}')
            cursor.execute(f'grant usage on schema erc to {RlsRoles.ALL_ROLES}')

    def apply_rls(self):
        for key in apps.all_models['reporting']:
            if key == 'emissioncategory':
                rls = apps.all_models['reporting'][key].Rls
                with connection.cursor() as cursor:
                    for grant in rls.grants:
                        grant.apply_grant(cursor)
                    if rls.enable_rls:
                        cursor.execute(f'alter table {rls.schema}.{rls.table} enable row level security')
                        for policy in rls.policies:
                            policy.apply_policy(cursor)
