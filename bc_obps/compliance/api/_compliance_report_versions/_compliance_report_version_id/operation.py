from typing import Literal, Tuple
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
from django.http import HttpRequest
from compliance.api.router import router
from compliance.constants import COMPLIANCE
from compliance.schema.compliance_report_version import OperationByComplianceSummaryOut
from registration.models import Operation
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.api.permissions import approved_authorized_roles_compliance_report_version_composite_auth


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/operation",
    response={200: OperationByComplianceSummaryOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get the operation associated with a compliance report version.",
    auth=approved_authorized_roles_compliance_report_version_composite_auth,
)
def get_operation_by_compliance_report_version_id(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[Literal[200], Operation]:
    """
    Get the operation associated with a compliance report version.
    At this time, this endpoint is only used for fetching the operation to populate the compliance page heading
    """
    return 200, ComplianceReportVersionService.get_operation_by_compliance_report_version(compliance_report_version_id)
