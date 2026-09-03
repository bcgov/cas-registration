from typing import Literal, Tuple
from django.http import HttpRequest
from compliance.constants import COMPLIANCE
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.api.router import router
from compliance.schema.calculated_penalty import CalculatedPenaltyOut
from compliance.service.penalty_calculation_service import (
    PenaltyCalculationService,
)
from common.permissions import authorize


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/obligation/calculate-penalty",
    response={200: CalculatedPenaltyOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Calculate the potential penalty for an obligation that is accruing a penalty",
    auth=authorize("authorized_irc_user"),
)
def get_calculated_penalty_for_obligation(
    request: HttpRequest, compliance_report_version_id: int, requested_penalty_type: str, end_date: str
) -> Tuple[Literal[200], CalculatedPenaltyOut] | Tuple[Literal[422], dict[str, str]]:

    return 200, PenaltyCalculationService.calculate_penalty_for_obligation(
        compliance_report_version_id, requested_penalty_type, end_date
    )
