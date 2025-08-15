from dataclasses import asdict
from ninja.types import DictStrAny
from compliance.api.router import router
from typing import Literal, Tuple
from django.http import HttpRequest
from compliance.schema.apply_compliance_units import AppliedComplianceUnitsOut
from compliance.service.bc_carbon_registry.apply_compliance_units_service import ApplyComplianceUnitsService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.constants import COMPLIANCE
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService
from compliance.api.permissions import approved_industry_user_compliance_report_version_composite_auth


@router.get(
    "/bccr/compliance-report-versions/{compliance_report_version_id}/applied-compliance-units",
    response={200: AppliedComplianceUnitsOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="""Returns applied compliance units for the given report version.
    - applied_compliance_units: List of units already applied.
    - can_apply_compliance_units: Whether additional units can be applied.""",
    auth=approved_industry_user_compliance_report_version_composite_auth,
)
def get_applied_compliance_units(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[Literal[200], DictStrAny]:
    # Get the compliance units
    applied_compliance_units_data = ApplyComplianceUnitsService.get_applied_compliance_units_data(
        compliance_report_version_id=compliance_report_version_id
    )

    # Determine if the user can still apply more units
    can_apply_compliance_units = ApplyComplianceUnitsService._can_apply_compliance_units(compliance_report_version_id)

    # Get the data_is_fresh flag
    refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
        compliance_report_version_id=compliance_report_version_id
    )

    return 200, {
        "applied_compliance_units": [asdict(unit) for unit in applied_compliance_units_data],
        "can_apply_compliance_units": can_apply_compliance_units,
        "data_is_fresh": refresh_result.data_is_fresh,
    }
