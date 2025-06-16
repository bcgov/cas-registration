from typing import List
from django.http import HttpRequest
from common.permissions import authorize
from compliance.constants import COMPLIANCE
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
from registration.schema.generic import Message
from compliance.api.router import router


@router.get(
    "/compliance-earned-credit/report-version-ids",
    response={200: List[int], custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get just the compliance report versions for all actioned earned credits",
    auth=authorize("authorized_irc_user"),
)
def get_compliance_report_version_ids_with_actioned_ecs(request: HttpRequest) -> List[int]:
    return ComplianceEarnedCreditsService.get_compliance_report_version_ids_with_actioned_ecs()
