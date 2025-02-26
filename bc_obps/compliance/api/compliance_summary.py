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
    summary = ComplianceDashboardService.get_compliance_summary_by_id(user_guid, summary_id)
    if not summary:
        return get_object_or_404(ComplianceSummary, id=summary_id)
    return 200, summary
