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
    "/compliance-report-versions/{compliance_report_version_id}/payments",
    response={200: PaymentsListOut, custom_codes_4xx: Message},
    tags=["Compliance"],
    description="Get payments for a compliance report version",
    auth=authorize("approved_industry_user"),
)
def get_compliance_report_version_payments(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[Literal[200], PaymentsList]:
    user_guid = get_current_user_guid(request)
    return 200, ComplianceDashboardService.get_compliance_report_version_payments(
        user_guid, compliance_report_version_id
    )
