from django.db.models import Value, Case, When, F, CharField, QuerySet, Subquery, OuterRef
from django.db.models.functions import Concat

from registration.models import User
from reporting.models import ReportVersion


class ReportingHistoryDashboardService:
    """
    Service providing data operations for the reporting dashboard
    """

    @classmethod
    def get_report_versions_for_report_history_dashboard(cls, report_id: int) -> QuerySet[ReportVersion]:
        """
        Fetches report versions for a given report_id, annotates it with user data
        if 'updated_by_id' exists, and assigns version names (e.g., 'Version 1'
        for the first version and 'Current Version' for the latest version).
        """
        report_versions = ReportVersion.objects.filter(report_id=report_id)

        # Safely get the first and last report versions, ensuring they exist
        if report_versions.exists():
            first_version = report_versions.first()
            last_version = report_versions.last()
            min_version_id = first_version.id if first_version else None
            max_version_id = last_version.id if last_version else None
        else:
            min_version_id = None
            max_version_id = None

        # Ensure that `min_version_id` and `max_version_id` are either valid IDs or None
        report_versions = report_versions.annotate(
            version=Case(
                When(id=min_version_id, then=Value("Version 1")),
                When(id=max_version_id, then=Value("Current Version")),
                default=Concat(Value("Version "), F("id")),
                output_field=CharField(),
            ),
            name=Subquery(
                User.objects.filter(user_guid=OuterRef('updated_by_id'))
                .annotate(full_name=Concat('first_name', Value(' '), 'last_name'))
                .values('full_name')[:1]
            ),
        ).order_by(F('id').desc())
        for report_version in report_versions:
            print(f"Report Version ID: {report_version.id}, Full Name: {report_version.name}")

        return report_versions
