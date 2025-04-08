from django.db.models import OuterRef, Subquery
from uuid import UUID
from typing import Optional
from ninja import Query
from django.db.models import QuerySet

from registration.models.operation import Operation
from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from service.data_access_service.operation_service import OperationDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from reporting.schema.operation import ReportingDashboardOperationFilterSchema


class ReportingDashboardService:
    @classmethod
    def get_operations_for_reporting_dashboard(
        cls,
        user_guid: UUID,
        reporting_year: int,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: ReportingDashboardOperationFilterSchema = Query(...),
    ) -> QuerySet[Operation]:

        user = UserDataAccessService.get_by_guid(user_guid)

        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"

        # Subquery to get the Report ID for the operation
        report_subquery = Report.objects.filter(operation_id=OuterRef("id"), reporting_year=reporting_year).values(
            "id"
        )[:1]

        # Subquery to get the latest ReportVersion.id for the report
        latest_version_id_subquery = (
            ReportVersion.objects.filter(report_id=Subquery(report_subquery)).order_by("-id").values("id")[:1]
        )

        # Subqueries for other fields from the latest ReportVersion
        latest_status_subquery = ReportVersion.objects.filter(id=Subquery(latest_version_id_subquery)).values("status")[
            :1
        ]

        latest_updated_by_subquery = ReportVersion.objects.filter(id=Subquery(latest_version_id_subquery)).values(
            "updated_by"
        )[:1]

        latest_updated_at_subquery = ReportVersion.objects.filter(id=Subquery(latest_version_id_subquery)).values(
            "updated_at"
        )[:1]

        queryset = (
            OperationDataAccessService.get_all_operations_for_user(user)
            .filter(status=Operation.Statuses.REGISTERED)
            .annotate(
                report_id=Subquery(report_subquery),
                report_version_id=Subquery(latest_version_id_subquery),
                report_status=Subquery(latest_status_subquery),
                submitted_by=Subquery(latest_updated_by_subquery),
                report_updated_at=Subquery(latest_updated_at_subquery),
            )
        )

        return filters.filter(queryset).order_by(sort_by)
