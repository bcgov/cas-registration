from dataclasses import asdict
from ninja.types import DictStrAny
from compliance.api.router import router
from typing import Dict, Literal, Tuple
from django.http import HttpRequest
from common.permissions import authorize
from compliance.schema.apply_compliance_units import ApplyComplianceUnitsIn, ApplyComplianceUnitsOut
from compliance.service.bc_carbon_registry.apply_compliance_units_service import ApplyComplianceUnitsService
from compliance.service.bc_carbon_registry.schema import FifteenDigitString
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.constants import COMPLIANCE
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService


@router.get(
    "/bccr/accounts/{account_id}/compliance-report-versions/{compliance_report_version_id}/compliance-units",
    response={200: ApplyComplianceUnitsOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get or create a BCCR compliance account and return consolidated details for the Apply Compliance Units page.",
    auth=authorize("approved_industry_user"),
)
def get_apply_compliance_units_page_data(
    request: HttpRequest, account_id: FifteenDigitString, compliance_report_version_id: int
) -> Tuple[Literal[200], ApplyComplianceUnitsOut]:
    apply_compliance_units_page_data = ApplyComplianceUnitsService.get_apply_compliance_units_page_data(
        account_id=account_id, compliance_report_version_id=compliance_report_version_id
    )

    response = ApplyComplianceUnitsOut(**asdict(apply_compliance_units_page_data))

    return 200, response


@router.post(
    "/bccr/accounts/{account_id}/compliance-report-versions/{compliance_report_version_id}/compliance-units",
    response={200: Dict[str, bool], custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="""
    Apply compliance units to a BCCR compliance account.
    Returns:
    - success (bool): Indicates whether the units were successfully applied.
    - can_apply_compliance_units (bool): Indicates whether the user can still apply additional units - used in frontend permission management.
    """,
    auth=authorize("approved_industry_user"),
)
def apply_compliance_units(
    request: HttpRequest,
    account_id: FifteenDigitString,
    compliance_report_version_id: int,
    payload: ApplyComplianceUnitsIn,
) -> Tuple[Literal[200], DictStrAny]:
    # Apply the units
    ApplyComplianceUnitsService.apply_compliance_units(
        account_id=account_id,
        compliance_report_version_id=compliance_report_version_id,
        payload=payload.model_dump(),
    )

    # Determine if the user can still apply more units
    can_apply_compliance_units = ApplyComplianceUnitsService._can_apply_compliance_units(compliance_report_version_id)

    # Get the data_is_fresh flag
    refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
        compliance_report_version_id=compliance_report_version_id
    )

    # Return flags in response
    return 200, {
        "success": True,
        "can_apply_compliance_units": can_apply_compliance_units,
        "data_is_fresh": refresh_result.data_is_fresh,
    }
