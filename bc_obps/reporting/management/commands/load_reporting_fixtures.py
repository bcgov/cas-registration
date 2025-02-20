from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Load fixtures for the reporting application'
    fixture_base_dir = 'reporting/fixtures/mock'

    def handle(self, *args, **options):
        fixtures = [
            f'{self.fixture_base_dir}/reporting_year.json',
            f'{self.fixture_base_dir}/report.json',
            f'{self.fixture_base_dir}/facility_report.json',
            f'{self.fixture_base_dir}/report_product.json',
        ]

        for fixture in fixtures:
            self.stdout.write(self.style.SUCCESS(f"Loading: {fixture}"))
            call_command('loaddata', fixture)
