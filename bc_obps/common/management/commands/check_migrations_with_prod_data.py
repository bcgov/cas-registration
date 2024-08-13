import os
import subprocess
from django.core.management.base import BaseCommand


PROD_DB_NAME = 'obps'
PROD_DB_USER = 'registration'
schema_names = ['public', 'erc', 'erc_history', 'common']


class Command(BaseCommand):
    """
    Before running this command, change the environment variables in the `.env` file to match the PROD environment.
    - Remove the DEBUG
    - Set ENVIRONMENT to prod
    - Set DB_NAME to obps
    - Set DB_USER to registration
    """

    help = 'Syncs the latest PROD data to the local environment and runs migrations'

    def add_arguments(self, parser):
        parser.add_argument('--pod-name', type=str, help='The name of the PostgreSQL pod')

    def handle(self, *args, **kwargs):
        pod_name = kwargs['pod_name']
        if not pod_name:
            self.stdout.write(self.style.ERROR('Pod name is required'))
            return

        dump_file_path = 'db.sql'
        try:
            # Switch to PROD environment
            self.stdout.write('Switching to PROD environment...')
            subprocess.check_call(['oc', 'project', 'd193ca-prod'])

            # Dump the database from the pod to a local file
            self.stdout.write(f"Streaming the PostgreSQL dump from pod: {pod_name}...")
            dump_command = f"oc exec {pod_name} -- pg_dump --format=c -d {PROD_DB_NAME} -n {' -n '.join(schema_names)}"
            with open(dump_file_path, 'wb') as f:
                subprocess.check_call(dump_command, shell=True, stdout=f)

            # Switch to DEV environment
            self.stdout.write('Switching to DEV environment...')
            subprocess.check_call(['oc', 'project', 'd193ca-dev'])

            # Create a new local database and grant privileges to the user(database level)
            self.stdout.write('Creating a new local database...')
            subprocess.check_call(['createdb', PROD_DB_NAME])
            subprocess.check_call(
                ['psql', '-d', PROD_DB_NAME, '-c', f'GRANT ALL ON DATABASE {PROD_DB_NAME} TO {PROD_DB_USER}']
            )

            # Create the schemas
            for schema_name in schema_names:
                self.stdout.write(f'Creating schema: {schema_name}...')
                subprocess.check_call(['psql', '-d', PROD_DB_NAME, '-c', f'CREATE SCHEMA IF NOT EXISTS {schema_name}'])
                # Grant privileges to the user(schema level)
                subprocess.check_call(
                    ['psql', '-d', PROD_DB_NAME, '-c', f'GRANT ALL ON SCHEMA {schema_name} TO {PROD_DB_USER}']
                )

            # Restore the database from the dump file
            self.stdout.write('Restoring the database...')
            restore_command = f"pg_restore -d {PROD_DB_NAME} -n {' -n '.join(schema_names)} {dump_file_path}"
            subprocess.check_call(restore_command, shell=True)

            # Run custom migrations
            self.stdout.write('Running migrations...')
            subprocess.check_call(['poetry', 'run', 'python', 'manage.py', 'custom_migrate'])

            # Drop the local database
            self.stdout.write('Dropping the local database...')
            subprocess.check_call(['dropdb', PROD_DB_NAME])

            self.stdout.write(self.style.SUCCESS('Successfully synced PROD data and ran migrations'))

        except Exception as e:
            # Drop the local database if it exists
            self.stdout.write('Dropping the local database...')
            subprocess.check_call(['dropdb', PROD_DB_NAME])
            self.stdout.write(self.style.ERROR(f'Command failed: {e}'))

        finally:
            # Ensure the dump file is deleted
            if os.path.exists(dump_file_path):
                os.remove(dump_file_path)
                self.stdout.write('Dump file deleted.')
