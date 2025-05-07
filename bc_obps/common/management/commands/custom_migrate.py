from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.management import call_command
from rls.utils.manager import RlsManager
from registration.models import Operation


class Command(BaseCommand):
    help = "Same as the default migrate command to apply RLS policies and load environment-specific fixtures."

    def handle(self, *args, **options):
        environment = settings.ENVIRONMENT
        call_command('migrate')
        RlsManager.re_apply_rls()
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
            call_command("pgtrigger", "enable", "--schema", "erc")
