from django.db.models import OuterRef, Subquery, Value, Case, When, F, CharField
from django.db.models.functions import Concat
from django.db.models.expressions import Window
from django.db.models.functions import RowNumber
from django.db.models import IntegerField

from registration.models import User
from reporting.models import ReportVersion


class ReportingHistoryDashboardService:
    """
    Service providing data operations for the reporting dashboard
    """

    @classmethod
    def get_report_versions_for_report_history_dashboard(cls, report_id: int):
        """
        Fetches report versions for a given report_id and annotates it with user data if updated_by_id exists.
        """
        # Fetch the report versions for the given report_id, ordered by ID (ascending)
        report_versions = ReportVersion.objects.filter(report_id=report_id).order_by("id")

        # Annotate with user name (full name)
        report_versions = report_versions.annotate(
            name=Subquery(
                User.objects.filter(user_guid=OuterRef('updated_by_id'))
                .annotate(full_name=Concat('first_name', Value(' '), 'last_name'))
                .values('full_name')[:1]
            ),
            version_number=Window(
                expression=RowNumber(),
                order_by=F("id").desc(),  # Ensure this is ascending order
            ),
        )

        # Identify the lowest and highest version IDs
        min_version_id = report_versions.first().id if report_versions.exists() else None
        max_version_id = report_versions.last().id if report_versions.exists() else None

        # Annotate with version name (and ensure "Current Version" comes first and "Version 1" comes last)
        report_versions = report_versions.annotate(
            version=Case(
                When(id=min_version_id, then=Value("Version 1")),
                When(id=max_version_id, then=Value("Current Version")),
                default=Concat(Value("Version "), F("version_number"), output_field=CharField()),
                output_field=CharField(),
            )
        )

        # Explicitly order the queryset: current version at the top, version 1 at the bottom
        report_versions = report_versions.order_by(
            F('id').desc(),# Ensure "Current Version" comes first
        )

        return report_versions
