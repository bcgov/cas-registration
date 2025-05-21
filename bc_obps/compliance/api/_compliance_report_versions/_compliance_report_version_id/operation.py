from typing import Literal, Tuple
from django.http import HttpRequest
from common.permissions import authorize
from compliance.api import router
from compliance.constants import COMPLIANCE
from compliance.models import ComplianceReportVersion
from compliance.schema.compliance_report_version import OperationByComplianceSummaryOut
from registration.models import Operation
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/operation",
    response={200: OperationByComplianceSummaryOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get the operation associated with a compliance report version.",
    auth=authorize("approved_industry_user"),
)
def get_operation_by_compliance_report_version_id(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[Literal[200], Operation]:
    """
    Get the operation associated with a compliance report version.
    At this time, this endpoint is only used for fetching the operation to populate the compliance page heading
    """
    compliance_report_version = ComplianceReportVersion.objects.get(id=compliance_report_version_id)
    return 200, compliance_report_version.compliance_report.report.operation


# Note: PUT and PATCH endpoints would be added here when needed
