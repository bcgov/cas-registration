from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from ninja.types import DictStrAny
from registration.constants import TRANSFER_EVENT_TAGS
from registration.models import TransferEvent
from common.api.utils import get_current_user_guid
from common.permissions import authorize
from registration.api.router import router
from registration.schema import TransferEventOut, TransferEventUpdateIn, Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.transfer_event_service import TransferEventService


@router.get(
    "/transfer-events/{uuid:transfer_id}",
    response={200: TransferEventOut, custom_codes_4xx: Message},
    tags=TRANSFER_EVENT_TAGS,
    description="""Retrieves the details of a specific transfer event by its ID. The endpoint checks if the current user is authorized to access the transfer event.""",
    auth=authorize("authorized_irc_user"),
)
def get_transfer_event(request: HttpRequest, transfer_id: UUID) -> Tuple[Literal[200], TransferEvent]:
    return 200, TransferEventService.get_if_authorized(get_current_user_guid(request), transfer_id)


@router.delete(
    "/transfer-events/{uuid:transfer_id}",
    response={200: DictStrAny, custom_codes_4xx: Message},
    tags=TRANSFER_EVENT_TAGS,
    description="""Deletes a transfer event by its ID.""",
    auth=authorize("cas_analyst"),
)
def delete_transfer_event(request: HttpRequest, transfer_id: UUID) -> Tuple[Literal[200], DictStrAny]:
    TransferEventService.delete_transfer_event(get_current_user_guid(request), transfer_id)
    return 200, {"success": True}


@router.patch(
    "/transfer-events/{uuid:transfer_id}",
    response={200: TransferEventOut, custom_codes_4xx: Message},
    tags=TRANSFER_EVENT_TAGS,
    description="""Updates the details of an existing transfer event by its ID.""",
    auth=authorize("cas_analyst"),
)
def update_transfer_event(
    request: HttpRequest, transfer_id: UUID, payload: TransferEventUpdateIn
) -> Tuple[Literal[200], TransferEvent]:
    return 200, TransferEventService.update_transfer_event(get_current_user_guid(request), transfer_id, payload)
