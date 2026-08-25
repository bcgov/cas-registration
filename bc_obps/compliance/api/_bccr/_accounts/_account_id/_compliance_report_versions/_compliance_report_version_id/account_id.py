from compliance.api.router import router
from typing import Literal, Tuple
from django.http import HttpRequest
from compliance.service.bc_carbon_registry.schema import FifteenDigitString
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.constants import BCCR
from compliance.service.bc_carbon_registry.account_service import BCCarbonRegistryAccountService
from compliance.service.bc_carbon_registry.exceptions import BCCarbonRegistryError
from compliance.schema.bccr_account import BCCRAccountDetailsSchema
from compliance.api.permissions import approved_industry_user_compliance_report_version_composite_auth

bccr_service = BCCarbonRegistryAccountService()


@router.get(
    "/bccr/accounts/{account_id}/compliance-report-versions/{compliance_report_version_id}",
    response={200: BCCRAccountDetailsSchema, custom_codes_4xx: Message},
    tags=BCCR,
    description="Get BCCR account details",
    auth=approved_industry_user_compliance_report_version_composite_auth,
)
def get_bccr_account_details(
    request: HttpRequest, account_id: FifteenDigitString, compliance_report_version_id: int
) -> Tuple[Literal[200], BCCRAccountDetailsSchema]:
    try:
        account_details = bccr_service.get_account_details(account_id=account_id)
        trading_name = getattr(account_details, "trading_name", None) if account_details else None
        return 200, BCCRAccountDetailsSchema(bccr_trading_name=trading_name)

    except BCCarbonRegistryError:
        # Handle exceptions that come from BCCR API
        return 200, BCCRAccountDetailsSchema(bccr_trading_name=None, has_remote_bccr_errors=True)
