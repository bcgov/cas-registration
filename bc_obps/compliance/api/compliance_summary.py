from typing import List, Literal, Tuple
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from django.db.models import QuerySet
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from compliance.models import ComplianceSummary
from compliance.schema.compliance_summary import ComplianceSummaryOut, ComplianceSummaryListOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja.pagination import paginate, PageNumberPagination
from registration.constants import PAGE_SIZE
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operation_service import OperationDataAccessService
from registration.models.operation import Operation
from .router import router


@router.get(
    "/summaries",
    response={200: List[ComplianceSummaryListOut], custom_codes_4xx: str},
    tags=["Compliance"],
    description="Get all compliance summaries for the current user's operations",
    auth=authorize("approved_industry_user"),
)
@paginate(PageNumberPagination, page_size=PAGE_SIZE)
def get_compliance_summaries_list(request: HttpRequest) -> QuerySet[ComplianceSummary]:
    """Get all compliance summaries for the current user's operations"""
    user_guid = get_current_user_guid(request)
    return ComplianceDashboardService.get_compliance_summaries_for_dashboard(user_guid)


@router.get(
    "/summaries/{summary_id}",
    response={200: ComplianceSummaryOut, custom_codes_4xx: str},
    tags=["Compliance"],
    description="Get a compliance summary by ID",
    auth=authorize("approved_industry_user"),
)
def get_compliance_summary(request: HttpRequest, summary_id: int) -> Tuple[Literal[200], ComplianceSummary]:
    """Get a compliance summary by ID"""
    user_guid = get_current_user_guid(request)
    user = UserDataAccessService.get_by_guid(user_guid)

    # Get all operations the user has access to
    operations = OperationDataAccessService.get_all_operations_for_user(user).filter(
        status=Operation.Statuses.REGISTERED
    )

    # Get the compliance summary if it belongs to one of the user's operations
    summary = get_object_or_404(
        ComplianceSummary.objects.select_related(
            'report', 'report__operation', 'current_report_version', 'compliance_period', 'obligation'
        ).filter(id=summary_id, report__operation__in=operations)
    )
    return 200, summary
