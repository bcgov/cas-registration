from typing import List, Literal, Optional, Tuple

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from django.db.models import QuerySet
from django.http import HttpRequest
from ninja import Query
from ninja.pagination import paginate
from ninja.types import DictStrAny

from registration.schema import Message
from registration.utils import CustomPagination
from registry.api.router import router
from registry.models import Account
from registry.schema.account import AccountFilterSchema, AccountOut
from service.account_service import AccountService
from service.error_service.custom_codes_4xx import custom_codes_4xx


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


@router.post(
    "/accounts",
    response={201: AccountOut, custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
def create_account(request: HttpRequest, payload: DictStrAny) -> Tuple[Literal[201], Account]:
    return 201, AccountService.create_account(get_current_user_guid(request), payload)
    