from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Load fixtures for the compliance application'
    fixture_base_dir = 'compliance/fixtures/mock'

    def handle(self, *args, **options):
        fixtures = [
            f'{self.fixture_base_dir}/compliance_periods.json',
            f'{self.fixture_base_dir}/compliance_summaries.json',
            f'{self.fixture_base_dir}/compliance_products.json',
            f'{self.fixture_base_dir}/compliance_obligations.json',
        ]

        for fixture in fixtures:
            self.stdout.write(self.style.SUCCESS(f"Loading: {fixture}"))
            call_command('loaddata', fixture)
