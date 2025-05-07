from typing import List
from django.http import HttpRequest
from django.db.models import QuerySet
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from compliance.models import ComplianceSummary
from compliance.schema.compliance_summary import ComplianceSummaryListOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja.pagination import paginate, PageNumberPagination
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from registration.schema.generic import Message
from .router import router


@router.get(
    "/summaries",
    response={200: List[ComplianceSummaryListOut], custom_codes_4xx: Message},
    tags=["Compliance"],
    description="Get all compliance summaries for the current user's operations",
    auth=authorize("approved_industry_user"),
)
@paginate(PageNumberPagination)
def get_compliance_summaries_list(request: HttpRequest) -> QuerySet[ComplianceSummary]:
    """Get all compliance summaries for the current user's operations"""
    user_guid = get_current_user_guid(request)
    return ComplianceDashboardService.get_compliance_summaries_for_dashboard(user_guid)


# Note: POST endpoint for creating a new summary would be added here when needed
