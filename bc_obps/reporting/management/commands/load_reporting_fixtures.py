import json
from django.core.management.base import BaseCommand
from django.core.management import call_command
from service.report_service import ReportService
from reporting.models.report_version import ReportVersion


class Command(BaseCommand):
    help = 'Load fixtures for the reporting application'
    fixture_base_dir = 'reporting/fixtures/mock'

    def handle(self, *args, **options):

        fixtures = [
            f'{self.fixture_base_dir}/reporting_year.json',
        ]

        self.load_fixtures(fixtures)

        self.stdout.write(self.style.SUCCESS(f"Creating Reports from {self.fixture_base_dir}/report.json"))
        self.load_reports()

        additional_fixtures = [
            f'{self.fixture_base_dir}/report_version.json',
            f'{self.fixture_base_dir}/facility_report.json',
            f'{self.fixture_base_dir}/report_activity.json',
            f'{self.fixture_base_dir}/raw_report_activity_data.json',
            f'{self.fixture_base_dir}/report_source_type.json',
            f'{self.fixture_base_dir}/report_unit.json',
            f'{self.fixture_base_dir}/report_fuel.json',
            f'{self.fixture_base_dir}/report_emission.json',
            f'{self.fixture_base_dir}/report_product.json',
            f'{self.fixture_base_dir}/report_emission_allocation.json',
            f'{self.fixture_base_dir}/report_product_emission_allocation.json',
        ]

        self.load_fixtures(additional_fixtures)

        # Update the status of report version for compliance
        ReportVersion.objects.filter(id__range=(3, 5), status='Draft').update(
            is_latest_submitted=True, status='Submitted'
        )

    def load_reports(self):
        reports_fixture = f'{self.fixture_base_dir}/report.json'
        with open(reports_fixture) as f:
            reports = json.load(f)
            for report in reports:
                ReportService.create_report(
                    operation_id=report['fields']['operation_id'],
                    reporting_year=report['fields']['reporting_year_id'],
                )

    def load_fixtures(self, fixtures):
        for fixture in fixtures:
            self.stdout.write(self.style.SUCCESS(f"Loading: {fixture}"))
            call_command('loaddata', fixture)
