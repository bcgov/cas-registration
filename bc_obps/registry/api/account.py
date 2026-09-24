import json
from typing import List, Literal, Optional
from django.http import HttpRequest
from registry.schema.account import AccountFilterSchema
from service.account_service import AccountService
from registry.models import Account, Unit, Project
from registration.schema import Message
from registry.api.router import router
from registry.schema import AccountOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from common.permissions import authorize
from django.db.models import QuerySet
from common.api.utils import get_current_user_guid
from ninja.pagination import paginate
from ninja import Query
from registration.utils import CustomPagination
from typing import List

@router.get(
    "/accounts",
    response={200: List[AccountOut], custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
@paginate(CustomPagination)
def list_accounts(
    request: HttpRequest,
    filters: AccountFilterSchema = Query(...),
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    sort_field: Optional[str] = None,
) -> QuerySet[Account]:
    return AccountService.list_accounts(sort_field, sort_order, filters)
    
