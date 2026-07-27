from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Load fixtures for the compliance application'
    fixture_base_dir = 'compliance/fixtures/mock'

    def add_arguments(self, parser):
        parser.add_argument('workflow', nargs='?', type=str, help='Name of the workflow')

    def handle(self, *args, **options):

        fixtures = [
            f'{self.fixture_base_dir}/compliance_penalty_rates.json',
        ]

        for fixture in fixtures:
            self.stdout.write(self.style.SUCCESS(f"Loading: {fixture}"))
            call_command('loaddata', fixture)
