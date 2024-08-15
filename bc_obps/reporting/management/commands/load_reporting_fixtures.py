from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Load fixtures for the reporting application'

    def handle(self, *args, **options):
        fixture_base_dir = 'reporting/fixtures/mock'

        fixtures = [
            f'{fixture_base_dir}/reporting_year.json',
            f'{fixture_base_dir}/report.json',
            f'{fixture_base_dir}/report_version.json',
            f'{fixture_base_dir}/facility_report.json',

        ]

        for fixture in fixtures:
            self.stdout.write(self.style.SUCCESS(f"Loading: {fixture}"))
            call_command('loaddata', fixture)
