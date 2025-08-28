import json
from uuid import UUID
from django.core.management.base import BaseCommand
from django.core.management import call_command
from reporting.management.commands.utils import submit_report_from_fixture
from reporting.models.report_version import ReportVersion
from service.report_service import ReportService


class Command(BaseCommand):
    help = 'Load test data into the application'
    fixture_base_dir = 'reporting/fixtures/test'

    def handle(self, *args, **options):

        fixtures = [
            f'{self.fixture_base_dir}/reporting_year.json',
        ]

        for fixture in fixtures:
            self.stdout.write(self.style.SUCCESS(f"Loading for test: {fixture}"))
            call_command('loaddata', fixture)

        self.stdout.write(self.style.SUCCESS(f"Creating Reports from {self.fixture_base_dir}/report.json"))
        self.load_reports()

    def load_reports(self):
        reports_fixture = f'{self.fixture_base_dir}/report.json'
        with open(reports_fixture) as f:
            reports = json.load(f)
            for report in reports:
                ReportService.create_report(
                    operation_id=report['fields']['operation_id'],
                    reporting_year=report['fields']['reporting_year_id'],
                )

            # submit report from operation / year combination
            report_versions_to_submit = [(UUID("ebc45617-ae4c-4c76-ab36-5a59c3aef407"), 2023)]  # SFO Operation 1
            for operation_id, year in report_versions_to_submit:
                # set up required data for submission
                # multiple report versions to submit if there are multiple years
                report_versions = ReportVersion.objects.filter(
                    report__operation_id=operation_id, report__reporting_year_id=year
                )

                for report_version in report_versions:
                    submit_report_from_fixture(report_version, UUID("b52343e2-2699-40d8-8fac-b4dbb52446e9"))
