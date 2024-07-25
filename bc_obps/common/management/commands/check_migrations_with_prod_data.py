import os
import subprocess
from django.core.management.base import BaseCommand


class Command(BaseCommand):
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
            # Switch to PROD environment here
            self.stdout.write('Switching to PROD environment...')
            subprocess.check_call(['oc', 'project', 'd193ca-dev'])

            # Dump the database
            self.stdout.write(f'Streaming the PostgreSQL dump from pod: {pod_name}...')
            dump_command = f"oc exec {pod_name} -- pg_dump --format=c -d obps"
            with open(dump_file_path, 'wb') as f:
                subprocess.check_call(dump_command, shell=True, stdout=f)

            # Switch to DEV environment here
            self.stdout.write('Switching to DEV environment...')
            subprocess.check_call(['oc', 'project', 'd193ca-dev'])

            self.stdout.write('Creating a new local database...')
            subprocess.check_call(['createdb', 'obps'])

            self.stdout.write('Restoring the database...')
            subprocess.check_call(['pg_restore', '-d', 'obps', dump_file_path])

            self.stdout.write('Running migrations...')
            subprocess.check_call(['poetry', 'run', 'python', 'manage.py', 'custom_migrate'])

            self.stdout.write('Dropping the local database...')
            subprocess.check_call(['dropdb', 'obps'])

            self.stdout.write(self.style.SUCCESS('Successfully synced PROD data and ran migrations'))

        except Exception as e:
            # Drop the local database if it exists
            self.stdout.write('Dropping the local database...')
            subprocess.check_call(['dropdb', 'obps'])
            self.stdout.write(self.style.ERROR(f'Command failed: {e}'))

        finally:
            # Ensure the dump file is deleted
            if os.path.exists(dump_file_path):
                os.remove(dump_file_path)
                self.stdout.write('Dump file deleted.')


"""
TODO: why do we need to create the roles in the database?
psql -d registration -c "CREATE ROLE registration;"
psql -d registration -c "CREATE ROLE postgres;"
psql -d registration -c "CREATE ROLE _crunchypgbouncer;"
"""
