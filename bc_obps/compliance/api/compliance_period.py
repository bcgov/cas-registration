from compliance.schema.compliance_period import CompliancePeriodOut
from compliance.models.compliance_period import CompliancePeriod
from compliance.service.compliance_period_service import CompliancePeriodService
from django.http import HttpRequest
from common.permissions import authorize
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from .router import router
from compliance.constants import COMPLIANCE


@router.get(
    "/compliance-period/{reporting_year}",
    response={200: CompliancePeriodOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get compliance period for reporting year",
    auth=authorize("approved_authorized_roles"),
)
def get_compliance_period_for_year(
    request: HttpRequest,
    reporting_year: int,
) -> CompliancePeriod:
    return CompliancePeriodService.get_compliance_period_for_year(reporting_year)
