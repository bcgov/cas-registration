from typing import Literal, Tuple
from django.http import HttpRequest
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from compliance.schema.payments import PaymentsListOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.service.compliance_dashboard_service import ComplianceDashboardService, PaymentsList
from registration.schema.generic import Message
from ...router import router


@router.get(
    "/summaries/{summary_id}/payments",
    response={200: PaymentsListOut, custom_codes_4xx: Message},
    tags=["Compliance"],
    description="Get payments for a compliance summary's obligation",
    auth=authorize("approved_industry_user"),
)
def get_compliance_summary_payments(request: HttpRequest, summary_id: int) -> Tuple[Literal[200], PaymentsList]:
    """Get payments for a compliance summary's obligation invoice"""
    user_guid = get_current_user_guid(request)
    return 200, ComplianceDashboardService.get_compliance_summary_payments(user_guid, summary_id)
