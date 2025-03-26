import os
import subprocess
from typing import Optional
import logging
from django.core.management.base import BaseCommand

# Constants
PROD_DB_NAME = 'obps'
PROD_DB_USER = 'registration'
SCHEMA_NAMES = ['public', 'erc', 'erc_history', 'common']
DUMP_FILE_PATH = 'db.sql'

# Required environment variables
REQUIRED_ENV = {
    'ENVIRONMENT': 'prod',
    'DB_NAME': PROD_DB_NAME,
    'DB_USER': PROD_DB_USER,
    'DEBUG': None,  # Explicitly unset DEBUG
}


class Command(BaseCommand):
    """
    Syncs PROD data to local environment and runs migrations.
    Forces these environment variables:
    - ENVIRONMENT=prod
    - DB_NAME=obps
    - DB_USER=registration
    - DEBUG= (unset)
    """

    help = 'Syncs the latest PROD data to the local environment and runs migrations'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = logging.getLogger(__name__)

    def add_arguments(self, parser):
        parser.add_argument('--pod-name', type=str, required=True, help='The name of the PostgreSQL pod')

    def _force_environment(self) -> None:
        """Force required environment variables to specific values."""
        self.stdout.write('Forcing required environment variables...')
        for key, value in REQUIRED_ENV.items():
            if value:
                os.environ[key] = value
            elif key in os.environ:
                del os.environ[key]  # Remove DEBUG if it exists

    @staticmethod
    def _execute_command(command: list | str, shell: bool = False, output_file=None) -> None:
        """Execute a subprocess command with error handling."""
        try:
            if output_file:
                subprocess.check_call(command, shell=shell, stdout=output_file)
            else:
                subprocess.check_call(command, shell=shell)
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Command failed: {command} - Error: {e}")

    def _create_database_and_schemas(self) -> None:
        """Create database and schemas with appropriate privileges."""
        self.stdout.write('Creating database and schemas...')
        self._execute_command(['createdb', PROD_DB_NAME])
        self._execute_command(
            ['psql', '-d', PROD_DB_NAME, '-c', f'GRANT ALL ON DATABASE {PROD_DB_NAME} TO {PROD_DB_USER}']
        )

        for schema in SCHEMA_NAMES:
            self._execute_command(['psql', '-d', PROD_DB_NAME, '-c', f'CREATE SCHEMA IF NOT EXISTS {schema}'])
            self._execute_command(['psql', '-d', PROD_DB_NAME, '-c', f'GRANT ALL ON SCHEMA {schema} TO {PROD_DB_USER}'])

    def _cleanup(self) -> None:
        """Clean up temporary files and database."""
        try:
            self._execute_command(['dropdb', '--if-exists', PROD_DB_NAME])
        except RuntimeError:
            self.stdout.write(self.style.WARNING('Failed to drop database during cleanup'))
        if os.path.exists(DUMP_FILE_PATH):
            os.remove(DUMP_FILE_PATH)
            self.stdout.write('Dump file deleted.')

    def handle(self, *args, **kwargs) -> None:
        pod_name: Optional[str] = kwargs['pod_name']
        if not pod_name:
            self.stdout.write(self.style.ERROR('Pod name is required'))
            return

        try:
            # Force environment variables to required values
            self._force_environment()

            # Switch to PROD and dump database
            self.stdout.write('Syncing from PROD environment...')
            self._execute_command(['oc', 'project', 'd193ca-prod'])
            dump_command = f"oc exec {pod_name} -- pg_dump --format=c -d {PROD_DB_NAME} -n {' -n '.join(SCHEMA_NAMES)}"
            with open(DUMP_FILE_PATH, 'wb') as f:
                self._execute_command(dump_command, shell=True, output_file=f)

            # Switch to DEV
            self.stdout.write('Switching to DEV environment...')
            self._execute_command(['oc', 'project', 'd193ca-dev'])

            # Setup database
            self._create_database_and_schemas()
            # We need this extension since it is used in the migrations
            self._execute_command(['psql', '-d', PROD_DB_NAME, '-c', 'CREATE EXTENSION IF NOT EXISTS btree_gist'])

            # Restore and migrate
            self.stdout.write('Restoring database and running migrations...')
            restore_command = f"pg_restore -d {PROD_DB_NAME} -n {' -n '.join(SCHEMA_NAMES)} {DUMP_FILE_PATH}"
            self._execute_command(restore_command, shell=True)
            self._execute_command(['poetry', 'run', 'python', 'manage.py', 'custom_migrate'])

            self.stdout.write(self.style.SUCCESS('Successfully synced PROD data and ran migrations'))

        except Exception as e:
            self.logger.error(f'Command failed: {str(e)}')
            self.stdout.write(self.style.ERROR(f'Command failed: {e}'))
            try:
                self._execute_command(['dropdb', '--if-exists', PROD_DB_NAME])
            except RuntimeError:
                self.stdout.write(self.style.WARNING('Failed to drop database during cleanup'))

        finally:
            self._cleanup()
