from compliance.api.router import router
from typing import Literal, Tuple, Optional, Dict
from django.http import HttpRequest
from common.permissions import authorize
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.constants import BCCR
from compliance.service.bc_carbon_registry.bc_carbon_registry_api_client import BCCarbonRegistryAPIClient

bccr_client = BCCarbonRegistryAPIClient()


@router.get(
    "/bccr/accounts/{account_id}",
    response={200: dict, custom_codes_4xx: Message},
    tags=BCCR,
    description="Get BCCR account details",
    auth=authorize("approved_industry_user"),
)
def get_bccr_account_details(request: HttpRequest, account_id: int) -> Tuple[Literal[200], Dict[str, Optional[str]]]:
    # At the time of writing, we only care about the account name.
    account_details = bccr_client.get_account_details(account_id=account_id)

    account_name = None
    entities = account_details.get("entities") if account_details else None

    if entities and isinstance(entities, list) and len(entities) > 0:
        first_entity = entities[0]
        account_name = first_entity.get("accountName")

    return 200, {"tradingName": account_name}
