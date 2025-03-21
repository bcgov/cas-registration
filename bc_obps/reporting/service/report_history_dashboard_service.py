from django.db.models import QuerySet, Window
from django.db.models.functions import RowNumber
from django.db.models import F
from reporting.models import ReportVersion


class ReportingHistoryDashboardService:
    """
    Service providing data operations for the reporting dashboard
    """

    @classmethod
    def get_report_versions_for_report_history_dashboard(cls, report_id: int) -> QuerySet[ReportVersion]:
        """
        Fetches report versions for a given report_id, assigns version numbers using SQL row_number(),
        and lets the frontend or Ninja schema handle the naming logic.
        """
        report_versions = (
            ReportVersion.objects.filter(report_id=report_id)
            .annotate(version_number=Window(expression=RowNumber(), order_by=F("id").desc()))
            .order_by("-id")
        )
        return report_versions
