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
from registry.models import Transfer
from registry.schema.transfer import TransferFilterSchema, TransferOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.transfer_credit_service import TransferCreditService


@router.get(
    "/transfers",
    response={200: List[TransferOut], custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
@paginate(CustomPagination)
def list_transfers(
    request: HttpRequest,
    filters: TransferFilterSchema = Query(...),
    sort_field: Optional[str] = "initiated_datetime",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[Transfer]:
    return TransferCreditService.list_transfers(sort_field, sort_order, filters)


@router.post(
    "/transfers",
    response={201: TransferOut, custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
def create_transfer(request: HttpRequest, payload: DictStrAny) -> Tuple[Literal[201], Transfer]:
    return 201, TransferCreditService.create_transfer(get_current_user_guid(request), payload)


@router.patch(
    "/transfers/{transfer_id}",
    response={200: TransferOut, custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
def update_transfer(
    request: HttpRequest,
    transfer_id: int,
    payload: DictStrAny,
) -> Tuple[Literal[200], Transfer]:
    return 200, TransferCreditService.update_transfer(get_current_user_guid(request), transfer_id, payload)


@router.put(
    "/transfers/{transfer_id}",
    response={200: TransferOut, custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
def update_transfer_put(
    request: HttpRequest,
    transfer_id: int,
    payload: DictStrAny,
) -> Tuple[Literal[200], Transfer]:
    return update_transfer(request, transfer_id, payload)
