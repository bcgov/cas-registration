from typing import Literal, Tuple, Optional
from django.http import HttpRequest
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from compliance.models import ComplianceReportVersion
from compliance.schema.compliance_report_version import ComplianceReportVersionOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from registration.schema.generic import Message
from ..router import router


@router.get(
    "/compliance_report_version/{compliance_report_version_id}",
    response={200: Optional[ComplianceReportVersionOut], custom_codes_4xx: Message},
    tags=["Compliance"],
    description="Get a compliance report version by ID",
    auth=authorize("approved_industry_user"),
)
def get_compliance_report_version(
    request: HttpRequest, summary_id: int
) -> Tuple[Literal[200], Optional[ComplianceReportVersion]]:
    """Get a compliance report version by ID"""
    user_guid = get_current_user_guid(request)
    compliance_report_version = ComplianceDashboardService.get_compliance_report_version_by_id(user_guid, summary_id)
    return 200, compliance_report_version


# Note: PUT and PATCH endpoints would be added here when needed
