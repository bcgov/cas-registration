from datetime import date
from reporting.models.report_version import ReportVersion
from .constants import REPORT_VERSION_DEFAULT_MONTH, REPORT_VERSION_DEFAULT_DAY


def get_report_valid_date_from_version_id(report_version_id: int) -> date:
    report_version = ReportVersion.objects.get(id=report_version_id)
    return date(report_version.report.reporting_year_id, REPORT_VERSION_DEFAULT_MONTH, REPORT_VERSION_DEFAULT_DAY)
