from typing import Tuple
from common.api.utils.current_user_utils import get_current_user
from django.http import HttpRequest
from compliance.constants import COMPLIANCE
from compliance.models import ComplianceEarnedCredit
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
from registration.schema.generic import Message
from compliance.api.router import router
from typing import Optional
from compliance.schema.compliance_earned_credits import ComplianceEarnedCreditsOut, ComplianceEarnedCreditsIn
from compliance.api.permissions import (
    approved_authorized_roles_compliance_report_version_composite_auth,
    approved_industry_user_cas_director_cas_analyst_compliance_report_version_composite_auth,
)


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/earned-credits",
    response={200: ComplianceEarnedCreditsOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get earned credits data for a compliance report version",
    exclude_none=True,  # Exclude fields with None values (e\.g\., analyst_suggestion) so frontend default values are used
    auth=approved_authorized_roles_compliance_report_version_composite_auth,
)
def get_compliance_report_version_earned_credits(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[int, Optional[ComplianceEarnedCreditsOut]]:
    compliance_earned_credits = ComplianceEarnedCreditsService.get_earned_credit_data_by_report_version(
        compliance_report_version_id
    )
    if compliance_earned_credits is not None and compliance_earned_credits.supplementary_declined is True:
        latest_compliance_report_version_id = ComplianceReportVersionService.get_latest_compliance_report_version_id(
            compliance_report_version_id
        )

    response = ComplianceEarnedCreditsOut.from_orm(compliance_earned_credits)
    response.latest_compliance_report_version_id = latest_compliance_report_version_id

    return 200, response


@router.put(
    "/compliance-report-versions/{compliance_report_version_id}/earned-credits",
    response={200: ComplianceEarnedCreditsOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Update earned credits data for a compliance report version",
    auth=approved_industry_user_cas_director_cas_analyst_compliance_report_version_composite_auth,
)
def update_compliance_report_version_earned_credit(
    request: HttpRequest, compliance_report_version_id: int, payload: ComplianceEarnedCreditsIn
) -> Tuple[int, ComplianceEarnedCredit]:
    user = get_current_user(request)
    earned_credit = ComplianceEarnedCreditsService.update_earned_credit(
        compliance_report_version_id, payload.model_dump(), user
    )
    return 200, earned_credit
