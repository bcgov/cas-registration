from uuid import UUID
from django.db.models import OuterRef, Subquery, QuerySet
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
        Fetches all operations for the user, ensuring only the latest report version is considered.
        """
        user = UserDataAccessService.get_by_guid(user_guid)

        # Subquery to get the latest report version ID for each report
        latest_report_version_subquery = ReportVersion.objects.filter(
            report_id=OuterRef("id")
        ).order_by("-id").values("id")[:1]

        # Subquery to get the latest report version status
        latest_report_status_subquery = ReportVersion.objects.filter(
            id=Subquery(latest_report_version_subquery)
        ).values("status")[:1]

        report_subquery = Report.objects.filter(
            operation_id=OuterRef("id"),
            reporting_year=reporting_year,
        ).annotate(
            latest_version_id=Subquery(latest_report_version_subquery),
            latest_version_status=Subquery(latest_report_status_subquery),
        )

        return (
            OperationDataAccessService.get_all_operations_for_user(user)
            .filter(status=Operation.Statuses.REGISTERED)
            .annotate(
                report_id=report_subquery.values("id"),
                report_version_id=report_subquery.values("latest_version_id"),
                report_status=report_subquery.values("latest_version_status"),
            )
        )
