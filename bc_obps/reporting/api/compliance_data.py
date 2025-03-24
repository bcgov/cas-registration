from typing import Literal, Tuple
from django.http import HttpRequest
from reporting.api.permissions import check_version_ownership_in_url
from reporting.constants import EMISSIONS_REPORT_TAGS
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.generic import Message
from reporting.service.compliance_service import ComplianceService, ComplianceData
from reporting.schema.compliance_data import ComplianceDataSchemaOut
from .router import router
from common.permissions import authorize


@router.get(
    "report-version/{report_version_id}/compliance-data",
    response={200: ComplianceDataSchemaOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the data for the compliance summary page from multiple data sources.""",
    exclude_none=True,
    auth=authorize("approved_industry_user", check_version_ownership_in_url("report_version_id")),
)
def get_compliance_summary_data(request: HttpRequest, report_version_id: int) -> Tuple[Literal[200], ComplianceData]:
    compliance_data = ComplianceService.get_calculated_compliance_data(report_version_id)

    return 200, compliance_data
