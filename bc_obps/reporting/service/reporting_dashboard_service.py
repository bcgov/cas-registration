from uuid import UUID
from django.db.models import OuterRef, Max, QuerySet, Subquery
from registration.models.operation import Operation
from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from service.data_access_service.operation_service import OperationDataAccessService
from service.data_access_service.user_service import UserDataAccessService


class ReportingDashboardService:
    """
    Service providing data operations for the reporting dashboard
    """

    @classmethod
    def get_operations_for_reporting_dashboard(cls, user_guid: UUID, reporting_year: int) -> QuerySet[Operation]:
        """
        Fetches all operations for the user, and annotates it with the associated report data required for the API call
        """
        user = UserDataAccessService.get_by_guid(user_guid)

        # Related docs: https://docs.djangoproject.com/en/5.1/ref/models/expressions/#subquery-expressions
        report_subquery = (
            Report.objects.filter(
                operation_id=OuterRef("id"),
                reporting_year=reporting_year,
            )
            .annotate(latest_version_id=Max("report_versions__id"))
            .annotate(
                latest_version_status=Subquery(
                    ReportVersion.objects.filter(report_id=OuterRef("id")).order_by("-id").values("status")[:1]
                )
            )
        )

        return OperationDataAccessService.get_all_operations_for_user(user).annotate(
            report_id=report_subquery.values("id"),
            report_version_id=report_subquery.values("latest_version_id"),
            report_status=report_subquery.values("latest_version_status"),
        )
