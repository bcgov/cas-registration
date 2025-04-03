from django.db.models import Window, QuerySet, Case, When, Value, CharField, IntegerField
from django.db.models.functions import RowNumber, Cast, Concat
from django.db.models import F
from reporting.models import ReportVersion


class ReportingHistoryDashboardService:
    """
    Service providing data operations for the report history dashboard
    """

    @classmethod
    def get_report_versions_for_report_history_dashboard(cls, report_id: int) -> QuerySet[ReportVersion]:
        filtered_versions = ReportVersion.objects.filter(report_id=report_id)
        report_versions = (
            filtered_versions.annotate(total_count=Cast(filtered_versions.count(), IntegerField()))
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

        return report_versions
