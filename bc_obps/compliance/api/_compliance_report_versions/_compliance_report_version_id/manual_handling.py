from typing import Optional, Tuple

from common.api.utils.current_user_utils import get_current_user
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.api.permissions import (
    approved_industry_user_cas_director_cas_analyst_compliance_report_version_composite_auth,
)
from compliance.api.router import router
from compliance.constants import COMPLIANCE
from compliance.models import ComplianceReportVersionManualHandling
from compliance.schema.compliance_report_version_manual_handling import (
    ComplianceReportVersionManualHandlingIn,
    ComplianceReportVersionManualHandlingOut,
)
from compliance.service.compliance_report_version_manual_handling_service import (
    ComplianceManualHandlingService,
)
from django.http import HttpRequest
from registration.schema.generic import Message


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/manual-handling",
    response={200: ComplianceReportVersionManualHandlingOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get manual handling data for a compliance report version",
    exclude_none=True,
    auth=authorize("authorized_irc_user"),
)
def get_compliance_report_version_manual_handling(
    request: HttpRequest,
    compliance_report_version_id: int,
) -> tuple[int, ComplianceReportVersionManualHandling | None]:
    record = ComplianceManualHandlingService.get_manual_handling_by_report_version(
        compliance_report_version_id
    )

    return 200, record


@router.put(
    "/compliance-report-versions/{compliance_report_version_id}/manual-handling",
    response={200: ComplianceReportVersionManualHandlingOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description=(
        "Update manual handling data for a compliance report version."
        "- CAS Analyst: may update `analyst_comment`."
        "- CAS Director: may update `director_decision`."
    ),
    auth=approved_industry_user_cas_director_cas_analyst_compliance_report_version_composite_auth,
)
def update_compliance_report_version_manual_handling(
    request: HttpRequest,
    compliance_report_version_id: int,
    payload: ComplianceReportVersionManualHandlingIn,
) -> tuple[int, ComplianceReportVersionManualHandling]:
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
