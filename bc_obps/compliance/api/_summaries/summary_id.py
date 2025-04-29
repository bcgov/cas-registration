from typing import Literal, Tuple, Optional
from django.http import HttpRequest
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from compliance.models import ComplianceSummary
from compliance.schema.compliance_summary import ComplianceSummaryOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.compliance.compliance_dashboard_service import ComplianceDashboardService
from registration.schema.generic import Message
from ..router import router


@router.get(
    "/summaries/{summary_id}",
    response={200: Optional[ComplianceSummaryOut], custom_codes_4xx: Message},
    tags=["Compliance"],
    description="Get a compliance summary by ID",
    auth=authorize("approved_industry_user"),
)
def get_compliance_summary(request: HttpRequest, summary_id: int) -> Tuple[Literal[200], Optional[ComplianceSummary]]:
    """Get a compliance summary by ID"""
    user_guid = get_current_user_guid(request)
    summary = ComplianceDashboardService.get_compliance_summary_by_id(user_guid, summary_id)
    return 200, summary


# Note: PUT and PATCH endpoints would be added here when needed
