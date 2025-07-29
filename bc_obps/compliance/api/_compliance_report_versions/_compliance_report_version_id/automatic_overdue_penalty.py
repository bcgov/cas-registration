from typing import Literal, Tuple
from django.http import HttpRequest
from common.permissions import authorize
from compliance.api.router import router
from compliance.constants import COMPLIANCE
from compliance.service.penalty_calculation_service import PenaltyCalculationService
from compliance.models.compliance_obligation import ComplianceObligation
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.schema.automatic_overdue_penalty import AutomaticOverduePenaltyOut


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/automatic-overdue-penalty",
    response={200: AutomaticOverduePenaltyOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get automatic overdue penalty data for a compliance report version.",
    auth=authorize("approved_industry_user"),
)
def get_automatic_overdue_penalty(request: HttpRequest, compliance_report_version_id: int) -> Tuple[Literal[200], dict]:
    """
    Get automatic overdue penalty data for a compliance report version.
    """
    # Get the compliance obligation for this compliance report version
    obligation = ComplianceObligation.objects.get(compliance_report_version_id=compliance_report_version_id)

    return 200, PenaltyCalculationService.get_penalty_data(obligation)
