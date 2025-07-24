from dataclasses import asdict
from ninja.types import DictStrAny
from compliance.api.router import router
from typing import Literal, Tuple
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
    description="""Returns applied compliance units for the given report version.
    - applied_compliance_units: List of units already applied.
    - can_apply_units: Whether additional units can be applied.""",
    auth=authorize("approved_industry_user"),
)
def get_applied_compliance_units(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[Literal[200], DictStrAny]:
    applied_compliance_units_data = ApplyComplianceUnitsService.get_applied_compliance_units_data(
        compliance_report_version_id=compliance_report_version_id
    )
    can_apply_units = ApplyComplianceUnitsService._can_apply_units(compliance_report_version_id)

    return 200, {
        "applied_compliance_units": [asdict(unit) for unit in applied_compliance_units_data],
        "can_apply_units": can_apply_units,
    }
