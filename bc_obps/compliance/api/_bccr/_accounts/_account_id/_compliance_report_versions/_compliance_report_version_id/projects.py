from ninja.types import DictStrAny
from compliance.api.router import router
from typing import Dict, Literal, Tuple
from django.http import HttpRequest
from common.permissions import authorize
from compliance.schema.project import ProjectIn
from compliance.service.bc_carbon_registry.project_service import BCCarbonRegistryProjectService
from compliance.service.bc_carbon_registry.schema import FifteenDigitString
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.constants import COMPLIANCE


bccr_project_service = BCCarbonRegistryProjectService()


@router.post(
    "/bccr/accounts/{account_id}/compliance-report-versions/{compliance_report_version_id}/projects",
    response={200: Dict[str, bool], custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Apply compliance units to a BCCR compliance account.",
    auth=authorize("approved_industry_user"),
)
def create_bccr_project(
    request: HttpRequest,
    account_id: FifteenDigitString,
    compliance_report_version_id: int,
    payload: ProjectIn,
) -> Tuple[Literal[200], DictStrAny]:
    bccr_project_service.create_project(
        account_id=account_id, compliance_report_version_id=compliance_report_version_id, payload=payload.model_dump()
    )
    return 200, {"success": True}
