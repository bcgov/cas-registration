from typing import Tuple
from django.http import HttpRequest
from common.permissions import authorize
from compliance.constants import COMPLIANCE
from compliance.models import ComplianceEarnedCredits
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
from registration.schema.generic import Message
from ...router import router
from typing import Optional


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/earned-credits",
    response={200: ComplianceEarnedCredits, 404: Message, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get earned credits data for a compliance report version",
    auth=authorize("approved_authorized_roles"),
)
def get_compliance_report_version_earned_credits(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[int, Optional[ComplianceEarnedCredits]]:
    compliance_earned_credits = ComplianceEarnedCreditsService.get_earned_credits_data_by_report_version(
        compliance_report_version_id
    )
    return 200, compliance_earned_credits
