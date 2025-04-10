from uuid import UUID
from django.db.models import OuterRef, QuerySet, Value, F, Subquery
from django.db.models.functions import Concat, Coalesce
from ninja import Query
from registration.models.operation import Operation
from reporting.models import ReportOperation
from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from service.data_access_service.operation_service import OperationDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from typing import Optional
from reporting.schema.operation import ReportingDashboardOperationFilterSchema


class ReportingDashboardService:
    """
    Service providing data operations for the reporting dashboard
    """

    @classmethod
    def get_operations_for_reporting_dashboard(
        cls,
        user_guid: UUID,
        reporting_year: int,
        sort_field: Optional[str] = None,
        sort_order: Optional[str] = None,
        filters: ReportingDashboardOperationFilterSchema = Query(...),
    ) -> QuerySet[Operation]:
        """
        Fetches all operations for the user, and annotates it with the associated report data required for the API call
        """
        user = UserDataAccessService.get_by_guid(user_guid)

        sort_field = sort_field or "id"
        sort_order = sort_order or "asc"
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        report_version_subquery = (
            ReportVersion.objects.filter(report_id=OuterRef("id"))
            .order_by("-id")
            .annotate(full_name=Concat(F("updated_by__first_name"), Value(" "), F("updated_by__last_name")))[:1]
        )

        # Related docs: https://docs.djangoproject.com/en/5.1/ref/models/expressions/#subquery-expressions
        report_subquery = (
            Report.objects.filter(
                operation_id=OuterRef("id"),
                reporting_year=reporting_year,
            )
            .annotate(latest_version_id=report_version_subquery.values("id"))
            .annotate(latest_version_status=report_version_subquery.values("status"))
            .annotate(latest_version_updated_at=report_version_subquery.values("updated_at"))
            .annotate(latest_version_updated_by=report_version_subquery.values("full_name"))
        )
        report_operation_name_subquery = ReportOperation.objects.filter(
            report_version__report__operation_id=OuterRef("id"),
            report_version__report__reporting_year=reporting_year,
        ).values("operation_name")[:1]

        queryset = (
            OperationDataAccessService.get_all_operations_for_user(user)
            .filter(status=Operation.Statuses.REGISTERED)  # ✅ Filter operations with status "Registered"
            .annotate(
                report_id=report_subquery.values("id"),
                report_version_id=report_subquery.values("latest_version_id"),
                report_status=report_subquery.values("latest_version_status"),
                report_updated_at=report_subquery.values("latest_version_updated_at"),
                report_submitted_by=report_subquery.values("latest_version_updated_by"),
                operation_name=Coalesce(Subquery(report_operation_name_subquery), F("name")),
            )
        )

        return filters.filter(queryset).order_by(sort_by)
