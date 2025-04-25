import json
from django.core.management.base import BaseCommand
from django.core.management import call_command
from service.report_service import ReportService
from reporting.models.report_version import ReportVersion


class Command(BaseCommand):
    help = 'Load fixtures for the reporting application'
    FIXTURE_BASE_DIR = 'reporting/fixtures/mock'

    FIXTURES = [
        'reporting_year',
        'report_version',
        'facility_report',
        'report_activity',
        'raw_report_activity_data',
        'report_source_type',
        'report_unit',
        'report_fuel',
        'report_emission',
        'report_product',
        'report_emission_allocation',
        'report_product_emission_allocation',
    ]

    def handle(self, *args, **options):
        for fixture in self.FIXTURES:
            fixture_path = f'{self.FIXTURE_BASE_DIR}/{fixture}.json'
            self.stdout.write(self.style.SUCCESS(f"Loading: {fixture_path}"))
            call_command('loaddata', fixture_path)
            if fixture == 'reporting_year':
                self.load_reports()

        # Update the status of report version for compliance
        ReportVersion.objects.filter(id__range=(3, 5), status='Draft').update(
            is_latest_submitted=True, status='Submitted'
        )

    def load_reports(self):
        reports_fixture = f'{self.FIXTURE_BASE_DIR}/report.json'
        with open(reports_fixture) as f:
            reports = json.load(f)
            for report in reports:
                ReportService.create_report(
                    operation_id=report['fields']['operation_id'],
                    reporting_year=report['fields']['reporting_year_id'],
                )
