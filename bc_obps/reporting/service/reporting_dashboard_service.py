from uuid import UUID

from django.db.models import OuterRef, QuerySet, Value, F, Subquery, Case, When, Q, CharField
from django.db.models.functions import Concat, Coalesce
from ninja import Query
from registration.models.operation import Operation
from reporting.models import ReportOperation
from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from service.data_access_service.operation_service import OperationDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from typing import Optional
from reporting.schema.dashboard import ReportingDashboardOperationFilterSchema
from service.user_operator_service import UserOperatorService


class ReportingDashboardService:
    """
    Service providing data operations for the reporting dashboard
    """

    first_report_version_subquery = (
        ReportVersion.objects.filter(report_id=OuterRef("id"))
        .order_by("id")  # ascending → earliest version first
        .values("id")[:1]
    )
    latest_report_version_subquery = (
        ReportVersion.objects.filter(report_id=OuterRef("id"))
        .order_by("-id")
        .annotate(
            full_name=Concat(F("updated_by__first_name"), Value(" "), F("updated_by__last_name")),
            operation_name=F("report_operation__operation_name"),
        )[:1]
    )
    latest_submitted_report_version_subquery = ReportVersion.objects.filter(
        report_id=OuterRef("id"), status="Submitted", is_latest_submitted=True
    ).annotate(
        full_name=Concat(F("updated_by__first_name"), Value(" "), F("updated_by__last_name")),
        operation_name=F("report_operation__operation_name"),
    )[
        :1
    ]
    report_status_sort_key = Case(
        When(
            Q(report_status="Draft") & ~Q(report_version_id=F("first_report_version_id")),
            then=Value("Draft Supplementary Report"),
        ),
        When(report_status="Draft", then=Value("Draft")),
        When(report_status=None, then=Value("Not Started")),
        default=F("report_status"),
        output_field=CharField(),
    )

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

        # Related docs: https://docs.djangoproject.com/en/5.1/ref/models/expressions/#subquery-expressions
        report_subquery = (
            Report.objects.filter(
                operation_id=OuterRef("id"),
                reporting_year=reporting_year,
            )
            .annotate(latest_version_id=cls.latest_report_version_subquery.values("id"))
            .annotate(latest_version_status=cls.latest_report_version_subquery.values("status"))
            .annotate(latest_version_updated_at=cls.latest_report_version_subquery.values("updated_at"))
            .annotate(latest_version_updated_by=cls.latest_report_version_subquery.values("full_name"))
            .annotate(first_version_id=cls.first_report_version_subquery.values("id"))
        )
        report_operation_name_subquery = ReportOperation.objects.filter(
            report_version__report__operation_id=OuterRef("id"),
            report_version__report__reporting_year=reporting_year,
        ).values("operation_name")[:1]

        queryset = (
            OperationDataAccessService.get_all_current_operations_for_user(user)
            .filter(status=Operation.Statuses.REGISTERED)  # ✅ Filter operations with status "Registered"
            .exclude(registration_purpose=Operation.Purposes.POTENTIAL_REPORTING_OPERATION)
            .annotate(
                report_id=report_subquery.values("id"),
                report_version_id=report_subquery.values("latest_version_id")[
                    :1
                ],  # the [:1] is necessary for the sorting and filters to work
                first_report_version_id=report_subquery.values("first_version_id")[:1],
                report_status=report_subquery.values("latest_version_status"),
                report_updated_at=report_subquery.values("latest_version_updated_at"),
                report_submitted_by=report_subquery.values("latest_version_updated_by"),
                operation_name=Coalesce(Subquery(report_operation_name_subquery), F("name")),
                # we have different statuses on the frontend than in the db, so we need to create a custom sort key
                report_status_sort_key=cls.report_status_sort_key,
            )
        )

        sort_fields = cls._get_sort_fields(sort_field, sort_order)

        return filters.filter(queryset).order_by(*sort_fields)

    @classmethod
    def get_reports_for_reporting_dashboard(
        cls,
        user_guid: UUID,
        current_reporting_year: int,
        get_past_reports: Optional[
            bool
        ] = None,  # if True, fetch past reports. If False, fetch current year reports. If None, fetch all reports.
        sort_field: Optional[str] = None,
        sort_order: Optional[str] = None,
        filters: ReportingDashboardOperationFilterSchema = Query(...),
    ) -> QuerySet[Report]:
        """
        Fetches reports, and annotates it with the associated operation data required for the API call
        If external user, only fetch reports for their operator

        """
        user = UserDataAccessService.get_by_guid(user_guid)
        is_internal = "cas_" in user.app_role_id

        queryset = Report.objects.all().annotate(
            report_id=F("id"),
            first_report_version_id=cls.first_report_version_subquery.values("id")[:1],
        )
        if is_internal:
            queryset = Report.objects.filter(report_versions__is_latest_submitted=True).annotate(
                report_id=F("id"),
                first_report_version_id=cls.first_report_version_subquery.values("id")[:1],
                report_updated_at=cls.latest_submitted_report_version_subquery.values("updated_at"),
                report_version_id=cls.latest_submitted_report_version_subquery.values("id"),
                report_status=cls.latest_submitted_report_version_subquery.values("status"),
                report_submitted_by=cls.latest_submitted_report_version_subquery.values("full_name"),
                operation_name=Coalesce(
                    Subquery(cls.latest_submitted_report_version_subquery.values("operation_name")),
                    F("operation__name"),
                ),
            )
        else:
            operator_id = UserOperatorService.get_current_user_approved_user_operator_or_raise(user).operator.id
            queryset = Report.objects.filter(operator_id=operator_id).annotate(
                report_id=F("id"),
                first_report_version_id=cls.first_report_version_subquery.values("id")[:1],
                report_updated_at=cls.latest_report_version_subquery.values("updated_at"),
                report_version_id=cls.latest_report_version_subquery.values("id"),
                report_status=cls.latest_report_version_subquery.values("status"),
                report_submitted_by=cls.latest_report_version_subquery.values("full_name"),
                operation_name=Coalesce(
                    Subquery(cls.latest_report_version_subquery.values("operation_name")), F("operation__name")
                ),
                report_status_sort_key=cls.report_status_sort_key,
            )

        if get_past_reports is not None:
            if get_past_reports:
                queryset = queryset.exclude(reporting_year=current_reporting_year)
            else:
                queryset = queryset.filter(reporting_year=current_reporting_year)
        # else get_past_report is None, so we fetch all reports

        sort_fields = cls._get_sort_fields(sort_field, sort_order)

        return filters.filter(queryset).order_by(*sort_fields)

    @classmethod
    def _get_sort_fields(cls, sort_field: Optional[str] = "id", sort_order: Optional[str] = "asc") -> list[str]:
        """
        Helper method to determine the sort fields based on the provided sort field and order.
        """
        sort_direction = "-" if sort_order == "desc" else ""
        if sort_field == "report_status":
            return [f"{sort_direction}report_status_sort_key"]
        return [f"{sort_direction}{sort_field}"]
