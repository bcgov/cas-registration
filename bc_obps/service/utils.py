from reporting.models.report_version import ReportVersion


def get_report_date_from_version_id(report_version_id: int) -> str:
    report_version = ReportVersion.objects.get(id=report_version_id)
    if report_version and report_version.report and report_version.report.created_at:
        return report_version.report.created_at.strftime('%Y-%m-%d')
    return ''
