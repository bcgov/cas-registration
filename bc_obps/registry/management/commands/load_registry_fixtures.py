from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Load fixtures for the registry application'
    fixture_base_dir = 'registry/fixtures/mock'

    def add_arguments(self, parser):
        parser.add_argument('workflow', nargs='?', type=str, help='Name of the workflow')

    def handle(self, *args, **options):

        fixtures = [
            f'{self.fixture_base_dir}/program.json',
            f'{self.fixture_base_dir}/account.json',
            f'{self.fixture_base_dir}/project.json',
            f'{self.fixture_base_dir}/issuance.json',
            f'{self.fixture_base_dir}/unit.json',
            f'{self.fixture_base_dir}/transfer.json',
        ]

        for fixture in fixtures:
            self.stdout.write(self.style.SUCCESS(f"Loading: {fixture}"))
            call_command('loaddata', fixture)

        self.stdout.write(self.style.SUCCESS(f"Loaded mock registry fixtures from {self.fixture_base_dir}"))
