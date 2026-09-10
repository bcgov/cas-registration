from datetime import datetime

from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from reporting.schema.comment import ReportCommentEventSchema


def _require_datetime(value: datetime | None, field_name: str) -> datetime:
    if value is None:
        raise ValueError(f"{field_name} must not be None")
    return value


class ReportCommentService:
    """
    Service class for handling report comments.
    """

    @staticmethod
    def get_report_events(report: Report, start_date: datetime) -> list[ReportCommentEventSchema]:
        """
        Fetch events for a given report version and start date.
        """
        report_versions = report.report_versions.all()
        events: list[ReportCommentEventSchema] = []
        created_versions = report_versions.filter(created_at__gte=start_date)
        for version in created_versions:
            events.append(ReportCommentService.generate_report_version_created_event(version))
        submitted_versions = report_versions.filter(updated_at__gte=start_date, status="SUBMITTED")
        for version in submitted_versions:
            events.append(ReportCommentService.generate_report_version_submitted_event(version))
        return events

    @staticmethod
    def generate_report_version_created_event(report_version: ReportVersion) -> ReportCommentEventSchema:
        """
        Generate event messages for a given report version.
        """
        created_at = _require_datetime(report_version.created_at, "report_version.created_at")
        VERSION_CREATED_MESSAGE = f'Report version {report_version.id} was created on {created_at}.'
        return ReportCommentEventSchema(
            report_version_id=report_version.id,
            created_at=created_at,
            comment=VERSION_CREATED_MESSAGE,
            event_type="VERSION_CREATED",
        )

    @staticmethod
    def generate_report_version_submitted_event(report_version: ReportVersion) -> ReportCommentEventSchema:
        """
        Generate event messages for a given report version.
        """
        updated_at = _require_datetime(report_version.updated_at, "report_version.updated_at")
        VERSION_SUBMITTED_MESSAGE = f'Report version {report_version.id} was submitted on {updated_at}.'
        return ReportCommentEventSchema(
            report_version_id=report_version.id,
            created_at=updated_at,
            comment=VERSION_SUBMITTED_MESSAGE,
            event_type="VERSION_SUBMITTED",
        )
