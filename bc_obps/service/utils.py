from reporting.models.report_version import ReportVersion

REPORT_VERSION_DATE_SUFFIX = (
    "-05-31"  # May 31st. Month and Day appended to reporting_year_id(calendar year as an int) to form a date string
)
# used to find the valid configuration for a report version


def get_report_valid_year_from_version_id(report_version_id: int) -> str:
    report_version = ReportVersion.objects.get(id=report_version_id)
    return f"{report_version.report.reporting_year_id}{REPORT_VERSION_DATE_SUFFIX}"
