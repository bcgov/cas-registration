from dataclasses import asdict
from ninja.types import DictStrAny
from compliance.api.router import router
from typing import Literal, Tuple, List
from django.http import HttpRequest
from common.permissions import authorize
from compliance.schema.apply_compliance_units import AppliedComplianceUnitsOut
from compliance.service.bc_carbon_registry.apply_compliance_units_service import ApplyComplianceUnitsService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.constants import COMPLIANCE


@router.get(
    "/bccr/compliance-report-versions/{compliance_report_version_id}/applied-compliance-units",
    response={200: AppliedComplianceUnitsOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get applied compliance units for a specific compliance report version.",
    auth=authorize("approved_industry_user"),
)
def get_applied_compliance_units(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[Literal[200], AppliedComplianceUnitsOut]:
    applied_compliance_units_data = ApplyComplianceUnitsService.get_applied_compliance_units_data(
        compliance_report_version_id=compliance_report_version_id
    )
    applied_compliance_units=[asdict(unit) for unit in applied_compliance_units_data]
    
    can_apply_units = ApplyComplianceUnitsService._can_apply_units(
            compliance_report_version_id=compliance_report_version_id
        )
    
    response = AppliedComplianceUnitsOut(
        applied_compliance_units=applied_compliance_units,
        can_apply_units=can_apply_units,
    )

    return 200, response