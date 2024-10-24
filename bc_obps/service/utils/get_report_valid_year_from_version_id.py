from reporting.models.report_version import ReportVersion
from .constants import REPORT_VERSION_DATE_SUFFIX


def get_report_valid_year_from_version_id(report_version_id: int) -> str:
    report_version = ReportVersion.objects.get(id=report_version_id)
    return f"{report_version.report.reporting_year_id}{REPORT_VERSION_DATE_SUFFIX}"
