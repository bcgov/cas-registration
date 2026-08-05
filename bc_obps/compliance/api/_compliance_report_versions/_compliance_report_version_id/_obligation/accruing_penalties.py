from typing import Literal, Tuple
from django.http import HttpRequest
from compliance.api.router import router
from compliance.constants import COMPLIANCE
from compliance.service.penalty_calculation_service import PenaltyCalculationService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.schema.accruing_penalties import AccruingPenaltiesOut
from compliance.api.permissions import approved_industry_user_compliance_report_version_composite_auth


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/obligation/accruing-penalties",
    response={200: AccruingPenaltiesOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get the penalty amounts accruing on an unpaid compliance obligation as of today.",
    auth=approved_industry_user_compliance_report_version_composite_auth,
)
def get_accruing_penalties(request: HttpRequest, compliance_report_version_id: int) -> Tuple[Literal[200], dict]:
    return 200, PenaltyCalculationService.get_accruing_penalty_data(compliance_report_version_id)
