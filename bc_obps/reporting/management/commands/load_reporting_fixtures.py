import json
from datetime import date, datetime, timezone
from decimal import Decimal
from uuid import UUID
from compliance.models.compliance_period import CompliancePeriod
from django.core.management.base import BaseCommand
from django.core.management import call_command
from reporting.management.commands.utils import submit_report_from_fixture
from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from reporting.models.reporting_year import ReportingYear
from service.report_service import ReportService
from service.report_version_service import ReportVersionService

SUFFIX = " - name from admin"


def _strip_admin_suffix(value: str | None) -> str | None:
    if value is None:
        return None
    return value.replace(SUFFIX, "").strip()


class Command(BaseCommand):
    help = 'Load fixtures for the reporting application'
    fixture_base_dir = 'reporting/fixtures/mock'

    def add_arguments(self, parser):
        parser.add_argument('workflow', nargs='?', type=str, help='Name of the workflow')

    def handle(self, *args, **options):

        fixtures = [
            f'{self.fixture_base_dir}/reporting_year.json',
        ]

        for fixture in fixtures:
            self.stdout.write(self.style.SUCCESS(f"Loading: {fixture}"))
            call_command('loaddata', fixture)

        self.stdout.write(self.style.SUCCESS(f"Creating Reports from {self.fixture_base_dir}/report.json"))
        workflow = options.get('workflow')
        self.load_reports(workflow)

        # Load any additional fixtures you need *after* reports exist
        extra = [
            f'{self.fixture_base_dir}/report_person_responsible.json',
            f'{self.fixture_base_dir}/report_raw_activity_data.json',
            f'{self.fixture_base_dir}/report_activity.json',
            f'{self.fixture_base_dir}/report_source_type.json',
            f'{self.fixture_base_dir}/report_unit.json',
            f'{self.fixture_base_dir}/report_fuel.json',
            f'{self.fixture_base_dir}/report_emission.json',
            f'{self.fixture_base_dir}/report_methodology.json',
            f'{self.fixture_base_dir}/report_product.json',
            f'{self.fixture_base_dir}/report_emission_allocation.json',
            f'{self.fixture_base_dir}/report_product_emission_allocation.json',
            f'{self.fixture_base_dir}/report_additional_data.json',
            f'{self.fixture_base_dir}/report_verification.json',
            f'{self.fixture_base_dir}/report_attachment.json',
        ]
        for fixture in extra:
            self.stdout.write(self.style.SUCCESS(f"Loading additional report fixture: {fixture}"))
            call_command('loaddata', fixture)

        self.submit_reports()

    def load_reports(self, workflow):
        reports_fixture = f'{self.fixture_base_dir}/report.json'
        with open(reports_fixture) as f:
            reports = json.load(f)
            current_year_minus_one = date.today().year - 1
            reports_to_create = []

            for report in reports:
                reports_to_create.append(report)
                if str(report['fields']['reporting_year_id']) == '2023':
                    duplicated_report = {
                        **report,
                        'fields': {
                            **report['fields'],
                            'reporting_year_id': current_year_minus_one,
                        },
                    }
                    reports_to_create.append(duplicated_report)

            reporting_year_ids = {int(report['fields']['reporting_year_id']) for report in reports_to_create}
            for reporting_year_id in reporting_year_ids:
                self.ensure_reporting_year_exists(reporting_year_id)

            report_version_ids = []
            for report in reports_to_create:
                report_version_id = ReportService.create_report(
                    operation_id=report['fields']['operation_id'],
                    reporting_year=report['fields']['reporting_year_id'],
                )
                report_version_ids.append(report_version_id)

            for rv_id in report_version_ids:
                report_version = ReportVersion.objects.get(id=rv_id)
                ro = report_version.report_operation
                ro.operator_legal_name = _strip_admin_suffix(ro.operator_legal_name)
                ro.operation_name = _strip_admin_suffix(ro.operation_name)
                ro.save()

    def ensure_reporting_year_exists(self, reporting_year_id: int):
        _, created = ReportingYear.objects.get_or_create(
            reporting_year=reporting_year_id,
            defaults={
                'reporting_window_start': datetime(reporting_year_id + 1, 1, 1, 0, 0, 0, tzinfo=timezone.utc),
                'reporting_window_end': datetime(
                    reporting_year_id + 1, 12, 31, 23, 59, 59, 999000, tzinfo=timezone.utc
                ),
                'report_due_date': datetime(reporting_year_id + 1, 5, 31, 23, 59, 59, 999000, tzinfo=timezone.utc),
                'report_open_date': datetime(reporting_year_id + 1, 3, 1, 0, 0, 0, tzinfo=timezone.utc),
                'description': f'Auto-created reporting year for fixture load: {reporting_year_id}',
            },
        )

        if created:
            self.stdout.write(self.style.WARNING(f"Created missing reporting year: {reporting_year_id}"))

        self.ensure_compliance_period_exists(reporting_year_id)

    def ensure_compliance_period_exists(self, reporting_year_id: int):
        _, created = CompliancePeriod.objects.get_or_create(
            reporting_year_id=reporting_year_id,
            defaults={
                'start_date': date(reporting_year_id, 1, 1),
                'end_date': date(reporting_year_id, 12, 31),
                'compliance_deadline': date(reporting_year_id + 1, 11, 30),
                'invoice_generation_date': date(reporting_year_id + 1, 11, 1),
                'max_credit_usage_percentage': Decimal('0.50'),
            },
        )

        if created:
            self.stdout.write(self.style.WARNING(f"Created missing compliance period: {reporting_year_id}"))

    def submit_reports(self):
        operation_ids_to_submit = [
            UUID('002d5a9e-32a6-4191-938c-2c02bfec592d'),  # Banana LFO
            UUID('b65a3fbc-c81a-49c0-a43a-67bd3a0b488e'),  # Bangles
        ]

        for operation_id in operation_ids_to_submit:
            # multiple report versions to submit if there are multiple years
            report_versions = ReportVersion.objects.filter(
                report__operation_id=operation_id,
            )

            for report_version in report_versions:
                submit_report_from_fixture(report_version, UUID('ba2ba62a-1218-42e0-942a-ab9e92ce8822'))

        # create supplementary report
        for report in Report.objects.filter(operation_id=operation_ids_to_submit[0]):
            ReportVersionService.create_report_version(report)
