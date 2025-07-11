from typing import Tuple
from common.api.utils.current_user_utils import get_current_user
from django.http import HttpRequest
from common.permissions import authorize
from compliance.constants import COMPLIANCE
from compliance.models import ComplianceEarnedCredit
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
from registration.schema.generic import Message
from compliance.api.router import router
from typing import Optional
from compliance.schema.compliance_earned_credits import ComplianceEarnedCreditsOut, ComplianceEarnedCreditsIn


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/earned-credits",
    response={200: ComplianceEarnedCreditsOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get earned credits data for a compliance report version",
    exclude_none=True,  # Exclude fields with None values (e\.g\., analyst_suggestion) so frontend default values are used
    auth=authorize("approved_authorized_roles"),
)
def get_compliance_report_version_earned_credits(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[int, Optional[ComplianceEarnedCredit]]:
    compliance_earned_credits = ComplianceEarnedCreditsService.get_earned_credit_data_by_report_version(
        compliance_report_version_id
    )
    return 200, compliance_earned_credits


@router.put(
    "/compliance-report-versions/{compliance_report_version_id}/earned-credits",
    response={200: ComplianceEarnedCreditsOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Update earned credits data for a compliance report version",
    auth=authorize("cas_director_analyst_and_approved_industry_user"),
)
def update_compliance_report_version_earned_credit(
    request: HttpRequest, compliance_report_version_id: int, payload: ComplianceEarnedCreditsIn
) -> Tuple[int, ComplianceEarnedCredit]:
    user = get_current_user(request)
    earned_credit = ComplianceEarnedCreditsService.update_earned_credit(
        compliance_report_version_id, payload.model_dump(), user
    )
    return 200, earned_credit
