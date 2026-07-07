from compliance.service.compliance_penalty_rate_service import CompliancePenaltyRateService
from compliance.models.compliance_penalty_rate import CompliancePenaltyRate
from compliance.schema.compliance_penalty_rate import CompliancePenaltyRateOut
from django.http import HttpRequest
from common.permissions import authorize
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from .router import router
from compliance.constants import COMPLIANCE


@router.get(
    "/compliance-penalty-rate",
    response={200: CompliancePenaltyRateOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get current compliance penalty rate",
    auth=authorize("all_roles"),
)
def get_current_compliance_penalty_rate(
    request: HttpRequest,
) -> CompliancePenaltyRate:
    return CompliancePenaltyRateService.get_current_compliance_penalty_rate()
