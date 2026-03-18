from typing import Iterable

from django.db.models import Window, Case, When, Value, CharField, IntegerField
from django.db.models.functions import RowNumber, Cast, Concat
from django.db.models import F
from reporting.models import ReportVersion


class ReportingHistoryDashboardService:
    """
    Service providing data operations for the report history dashboard
    """

    @classmethod
    def get_report_versions_for_report_history_dashboard(
        cls, report_id: int, hide_draft_versions: bool = False
    ) -> Iterable[ReportVersion]:
        filtered_versions = ReportVersion.objects.filter(report_id=report_id)

        total_count = filtered_versions.count()
        report_versions = (
            filtered_versions.annotate(total_count=Value(total_count, output_field=IntegerField()))
            .annotate(version_number=Window(expression=RowNumber(), order_by=F("id").desc()))
            .annotate(
                version=Case(
                    When(version_number=1, then=Value("Current Version")),
                    default=Concat(Value("Version "), Cast(F('total_count') - F("version_number") + 1, CharField())),
                    output_field=CharField(),
                )
            )
            .order_by("version_number")
        )

        # Using the django ORM .exclude(status='Draft') would have the annotation with the version numbering
        # applied after removing the draft versions, so we need to evaluate the queryset manually.
        # We will never have a large number of report versions, the performance penalty is negligible
        if hide_draft_versions:
            return [rv for rv in report_versions if rv.status != "Draft"]

        return report_versions
