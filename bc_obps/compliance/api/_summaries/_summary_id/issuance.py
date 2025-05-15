from typing import Tuple, Union
from django.http import HttpRequest
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from compliance.models import ComplianceSummary
from compliance.schema.compliance_summary import ComplianceSummaryIssuanceOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from registration.schema.generic import Message
from ...router import router


@router.get(
    "/summaries/{summary_id}/issuance",
    response={200: ComplianceSummaryIssuanceOut, 404: Message, custom_codes_4xx: Message},
    tags=["Compliance"],
    description="Get issuance data for a compliance summary",
    auth=authorize("approved_authorized_roles"),
)
def get_compliance_summary_issuance(
    request: HttpRequest, summary_id: int
) -> Tuple[int, Union[ComplianceSummary, Message]]:
    """Get issuance data for a compliance summary"""
    user_guid = get_current_user_guid(request)
    summary = ComplianceDashboardService.get_compliance_summary_issuance_data(user_guid, summary_id)
    if not summary:
        return 404, Message(message="Not Found")
    return 200, summary
