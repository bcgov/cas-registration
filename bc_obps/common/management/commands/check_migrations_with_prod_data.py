import os
import subprocess
from typing import Optional
import logging
import random
from django.core.management.base import BaseCommand
from django.db import connections
from registration.models import User

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
    # Explicitly unset some environment variables
    'DEBUG': None,
    'CHES_CLIENT_ID': None,
    'CHES_CLIENT_SECRET': None,
    'CHES_TOKEN_ENDPOINT': None,
    'CHES_API_URL': None,
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

    help = 'Syncs the latest PROD data to the local environment and runs migrations. Obfuscates sensitive user data by default.'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = logging.getLogger(__name__)

    @classmethod
    def add_arguments(cls, parser):
        parser.add_argument('--pod-name', type=str, required=True, help='The name of the PostgreSQL pod')
        parser.add_argument(
            '--skip-obfuscation',
            action="store_true",
            help='Skip obfuscation of sensitive user data (first_name, last_name, email, phone_number). Default: False.',
        )

    def _force_environment(self) -> None:
        """Force required environment variables to specific values."""
        self.stdout.write(self.style.SUCCESS('🔧 Setting up environment variables...'))
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

    def _create_database(self) -> None:
        self.stdout.write(self.style.SUCCESS('🗄️  Creating database and schemas...'))
        self._execute_command(['createdb', PROD_DB_NAME])

    def _cleanup(self) -> None:
        """Clean up temporary files and database."""
        try:
            # Close Django connections first, otherwise dropdb will fail
            self.stdout.write(self.style.WARNING('🔌 Closing database connections...'))
            for connection in connections.all():
                connection.close()
            self.stdout.write('Database connections closed.')

            self._execute_command(['dropdb', '--if-exists', PROD_DB_NAME])
            self.stdout.write('Database dropped with regular dropdb.')
        except RuntimeError as e:
            self.stdout.write(self.style.WARNING(f'Failed to drop database during cleanup: {e}'))
        finally:
            if os.path.exists(DUMP_FILE_PATH):
                os.remove(DUMP_FILE_PATH)
                self.stdout.write('Dump file deleted.')

    def _setup_database_permissions(self) -> None:
        self.stdout.write(self.style.WARNING('🔐 Setting up table permissions for erc schema...'))

        for schema in SCHEMA_NAMES:
            self._execute_command(['psql', '-d', PROD_DB_NAME, '-c', f'CREATE SCHEMA IF NOT EXISTS {schema}'])
            self._execute_command(['psql', '-d', PROD_DB_NAME, '-c', f'GRANT ALL ON SCHEMA {schema} TO {PROD_DB_USER}'])

        self._execute_command(
            ['psql', '-d', PROD_DB_NAME, '-c', f'GRANT ALL ON DATABASE {PROD_DB_NAME} TO {PROD_DB_USER}']
        )
        self._execute_command(
            [
                'psql',
                '-d',
                PROD_DB_NAME,
                '-c',
                f'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA erc TO {PROD_DB_USER}',
            ]
        )
        self._execute_command(
            [
                'psql',
                '-d',
                PROD_DB_NAME,
                '-c',
                f'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA erc TO {PROD_DB_USER}',
            ]
        )
        self._execute_command(
            [
                'psql',
                '-d',
                PROD_DB_NAME,
                '-c',
                f'GRANT USAGE ON SCHEMA erc TO {PROD_DB_USER}',
            ]
        )

    def _sync_production_data(self, pod_name: str) -> None:
        """Sync data from production environment."""
        self.stdout.write(self.style.SUCCESS('📥 Syncing from PROD environment...'))
        self._execute_command(['oc', 'project', 'd193ca-prod'])
        dump_command = f"oc exec {pod_name} -- pg_dump --format=c -d {PROD_DB_NAME} -n {' -n '.join(SCHEMA_NAMES)}"
        with open(DUMP_FILE_PATH, 'wb') as f:
            self._execute_command(dump_command, shell=True, output_file=f)

    def _restore_database(self) -> None:
        """Restore database from production dump."""
        self.stdout.write(self.style.SUCCESS('📤 Restoring database from dump...'))
        restore_command = f"pg_restore -d {PROD_DB_NAME} -n {' -n '.join(SCHEMA_NAMES)} {DUMP_FILE_PATH}"
        self._execute_command(restore_command, shell=True)

    def _obfuscate_user_data(self) -> None:
        self.stdout.write(self.style.WARNING('🔒 Obfuscating sensitive user data...'))
        try:
            from django.db import transaction

            users = User.objects.all()
            total_users = users.count()

            if total_users == 0:
                self.stdout.write(self.style.WARNING('⚠️  No users found to obfuscate.'))
                return

            self.stdout.write(f'📊 Found {total_users} users to obfuscate.')

            # Process all users within an atomic transaction
            with transaction.atomic():
                for counter, user in enumerate(User.objects.all().order_by('user_guid'), start=1):
                    # Generate obfuscated data
                    user.first_name = f"User{random.randint(1000, 9999)}"
                    user.last_name = f"Test{random.randint(1000, 9999)}"
                    user.email = f"user{counter:04d}@example.com"
                    user.phone_number = "+16044011234"
                    user.save(update_fields=['first_name', 'last_name', 'email', 'phone_number'])
                    user.refresh_from_db()

                    # Progress indicator
                    if counter % 100 == 0:
                        self.stdout.write(f'⏳ Processed {counter}/{total_users} users...')

            # Verify obfuscation worked
            self.stdout.write('🔍 Verifying obfuscation...')
            sample_user = User.objects.first()

            if sample_user and sample_user.email.startswith('user') and sample_user.email.endswith('@example.com'):
                self.stdout.write(self.style.SUCCESS(f'✅ Successfully obfuscated {total_users} users.'))
            else:
                self.stdout.write(self.style.ERROR('❌ Obfuscation verification failed!'))
                self.stdout.write(f'Sample user email: {sample_user.email if sample_user else "No users found"}')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error during obfuscation: {e}'))
            raise

    def handle(self, *args, **options) -> None:
        pod_name: Optional[str] = options['pod_name']
        skip_obfuscation = options.get('skip_obfuscation')  # Obfuscation enabled by default

        if not pod_name:
            self.stdout.write(self.style.ERROR('Pod name is required'))
            return

        # Display header
        self.stdout.write('═' * 60)
        self.stdout.write(self.style.SUCCESS('🚀 Starting PROD data sync and migration process'))
        self.stdout.write('═' * 60)

        try:
            # Force environment variables to required values
            self._force_environment()
            self.stdout.write('─' * 60)

            # Sync data from production
            self._sync_production_data(pod_name)
            self.stdout.write('─' * 60)

            # Switch to DEV
            self.stdout.write(self.style.SUCCESS('🔄 Switching to DEV environment...'))
            self._execute_command(['oc', 'project', 'd193ca-dev'])

            # Setup database
            self._create_database()

            # We need this extension since it is used in the migrations
            self.stdout.write(self.style.SUCCESS('🔧 Installing btree_gist extension...'))
            self._execute_command(['psql', '-d', PROD_DB_NAME, '-c', 'CREATE EXTENSION IF NOT EXISTS btree_gist'])
            self.stdout.write('─' * 60)

            self._setup_database_permissions()
            self.stdout.write('─' * 60)

            self._restore_database()
            self.stdout.write('─' * 60)

            if not skip_obfuscation:
                self._obfuscate_user_data()
                self.stdout.write('─' * 60)

            # Run migrations
            self.stdout.write(self.style.SUCCESS('🔄 Running migrations...'))
            self._execute_command(['poetry', 'run', 'python', 'manage.py', 'custom_migrate'])

            self.stdout.write('═' * 60)
            self.stdout.write(self.style.SUCCESS('🎉 Successfully synced PROD data and ran migrations!'))
            self.stdout.write('═' * 60)

        except Exception as e:
            self.logger.error(f'Command failed: {str(e)}')
            self.stdout.write(self.style.ERROR(f'Command failed: {e}'))
            self._cleanup()

        finally:
            self._cleanup()
