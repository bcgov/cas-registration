from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Creates an empty migration file for each installed app.'

    def add_arguments(self, parser):
        parser.add_argument('migration_name', type=str, help='Name of the migration.')

    def handle(self, *args, **options):
        migration_name = options['migration_name']
        if not migration_name:
            raise CommandError("Migration name is required.")

        for app_label in (app for app in settings.INSTALLED_APPS if app not in settings.APPS_TO_NOT_INCLUDE_IN_PROD):
            try:
                # This command creates an empty migration with the specified name
                call_command('makemigrations', app_label, empty=True, name=f'V{migration_name}')
                self.stdout.write(self.style.SUCCESS(f'Successfully created migration for {app_label}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to create migration for {app_label}: {str(e)}'))
