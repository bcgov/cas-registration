from reporting.models.facility_report import FacilityReport
from reporting.models.report_version import ReportVersion


def mark_facility_reports_complete(
    report_version: ReportVersion,
) -> None:
    """
    Mark all facility reports for a report version as complete.
    """

    FacilityReport.objects.filter(
        report_version=report_version,
    ).update(
        is_completed=True,
    )
