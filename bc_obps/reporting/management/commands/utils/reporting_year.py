from datetime import date, datetime, timezone
from decimal import Decimal

from compliance.models.compliance_period import CompliancePeriod
from reporting.models.reporting_year import ReportingYear


def ensure_reporting_year_exists(reporting_year_id: int):
    _, created = ReportingYear.objects.get_or_create(
        reporting_year=reporting_year_id,
        defaults={
            'reporting_window_start': datetime(reporting_year_id + 1, 1, 1, 0, 0, 0, tzinfo=timezone.utc),
            'reporting_window_end': datetime(reporting_year_id + 1, 12, 31, 23, 59, 59, 999000, tzinfo=timezone.utc),
            'report_due_date': datetime(reporting_year_id + 1, 5, 31, 23, 59, 59, 999000, tzinfo=timezone.utc),
            'report_open_date': datetime(reporting_year_id + 1, 3, 1, 0, 0, 0, tzinfo=timezone.utc),
            'description': f'Auto-created reporting year for fixture load: {reporting_year_id}',
        },
    )

    if created:
        print(f"Created missing reporting year: {reporting_year_id}")


def ensure_compliance_period_exists(reporting_year_id: int):
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
        print(f"Created missing compliance period: {reporting_year_id}")


def ensure_temporal_objects_exist(reporting_year_id: int):
    ensure_reporting_year_exists(reporting_year_id)
    ensure_compliance_period_exists(reporting_year_id)
