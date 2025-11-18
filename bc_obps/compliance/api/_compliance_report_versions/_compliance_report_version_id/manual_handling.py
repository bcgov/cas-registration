from typing import Optional, Literal, Tuple
from django.http import HttpRequest
from common.api.utils.current_user_utils import get_current_user
from compliance.api.router import router
from compliance.constants import COMPLIANCE
from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.api.permissions import (
    approved_authorized_roles_compliance_report_version_composite_auth,
)
from compliance.models import ComplianceReportVersionManualHandling
from compliance.schema.compliance_report_version_manual_handling import ComplianceReportVersionManualHandlingOut, ComplianceReportVersionManualHandlingIn
from compliance.service.compliance_report_version_manual_handling_service import ComplianceManualHandlingService

@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/manual-handling",
    response={
        200: ComplianceReportVersionManualHandlingOut,
        204: None,
        custom_codes_4xx: Message,
    },
    tags=COMPLIANCE,
    description="Get manual handling data for a compliance report version",
    exclude_none=True,
    auth=approved_authorized_roles_compliance_report_version_composite_auth,
)
def get_compliance_report_version_manual_handling(
    request: HttpRequest,
    compliance_report_version_id: int,
) -> Tuple[Literal[200, 204], Optional[ComplianceReportVersionManualHandling]]:
    # record = ComplianceManualHandlingService.get_manual_handling_by_report_version(
    #     compliance_report_version_id
    # )

    # if record is None:
    #     return 204, None

    return 200, None



@router.put(
    "/compliance-report-versions/{compliance_report_version_id}/manual-handling",
    response={200: ComplianceReportVersionManualHandlingOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description=(
        "Update manual handling data for a compliance report version.\n\n"
        "- CAS Analyst: may update `analyst_comment`.\n"
        "- CAS Director: may update `director_comment` and `director_decision`."
    ),
    auth=approved_authorized_roles_compliance_report_version_composite_auth,
)
def update_compliance_report_version_manual_handling(
    request: HttpRequest,
    compliance_report_version_id: int,
    payload: ComplianceReportVersionManualHandlingIn,
) -> Tuple[int, ComplianceReportVersionManualHandling]:
    """
    Delegates to ComplianceReportVersionManualHandlingService.update_manual_handling,
    which enforces role-based rules (analyst vs director).
    """
    user = get_current_user(request)

    record = ComplianceManualHandlingService.update_manual_handling(
        compliance_report_version_id=compliance_report_version_id,
        payload=payload.model_dump(),
        user=user,
    )
    return 200, record
