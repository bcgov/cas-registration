from typing import Literal, Tuple
from django.http import HttpRequest
from compliance.api.router import router
from compliance.constants import COMPLIANCE
from compliance.service.penalty_calculation_service import PenaltyCalculationService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.schema.late_submission_penalty import LateSubmissionPenaltyOut
from compliance.api.permissions import approved_industry_user_compliance_report_version_composite_auth


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/late-submission-penalty",
    response={200: LateSubmissionPenaltyOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get late submission penalty data for a compliance report version.",
    auth=approved_industry_user_compliance_report_version_composite_auth,
)
def get_late_submission_penalty(request: HttpRequest, compliance_report_version_id: int) -> Tuple[Literal[200], dict]:
    """
    Get late submission penalty data for a compliance report version.
    """
    return 200, PenaltyCalculationService.get_late_submission_penalty_data(compliance_report_version_id)
