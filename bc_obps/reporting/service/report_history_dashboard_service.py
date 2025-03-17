from uuid import UUID
from django.db.models import OuterRef, Max, QuerySet, Subquery

from registration.models import User
from reporting.models.report_version import ReportVersion


class ReportingHistoryDashboardService:
    """
    Service providing data operations for the reporting dashboard
    """

    @classmethod
    def get_report_versions_for_report_history_dashboard(cls, user_guid: UUID, report_id: int) -> QuerySet[ReportVersion]:
        """
        Fetches report versions for a given report_id and annotates it with user data if updated_by_id exists.
        """
        # Fetch the report versions for the given report_id
        report_versions = ReportVersion.objects.filter(report_id=report_id)

        # Annotate with user data if updated_by_id is present
        return report_versions.annotate(
            updated_by_firstname=Subquery(
                User.objects.filter(user_guid=OuterRef('updated_by_id'))
                .values('firstname')[:1]
            ),
            updated_by_lastname=Subquery(
                User.objects.filter(user_guid=OuterRef('updated_by_id'))
                .values('lastname')[:1]
            )
        )
