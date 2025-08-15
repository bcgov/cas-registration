from compliance.api.router import router
from typing import Literal, Tuple, Optional, Dict
from django.http import HttpRequest
from compliance.service.bc_carbon_registry.schema import FifteenDigitString
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.constants import BCCR
from compliance.service.bc_carbon_registry.account_service import BCCarbonRegistryAccountService
from compliance.api.permissions import approved_industry_user_compliance_report_version_composite_auth

bccr_service = BCCarbonRegistryAccountService()


@router.get(
    "/bccr/accounts/{account_id}/compliance-report-versions/{compliance_report_version_id}",
    response={200: dict, custom_codes_4xx: Message},
    tags=BCCR,
    description="Get BCCR account details",
    auth=approved_industry_user_compliance_report_version_composite_auth,
)
def get_bccr_account_details(
    request: HttpRequest, account_id: FifteenDigitString
) -> Tuple[Literal[200], Dict[str, Optional[str]]]:
    account_details = bccr_service.get_account_details(account_id=account_id)
    trading_name = getattr(account_details, "trading_name", None) if account_details else None
    return 200, {"bccr_trading_name": trading_name}
