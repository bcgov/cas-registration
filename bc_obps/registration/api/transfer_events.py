from typing import Literal

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.db.models import QuerySet
from django.http import HttpRequest
from ninja import Query
from ninja.pagination import paginate
from registration.api.router import router
from registration.constants import TRANSFER_EVENT_TAGS
from registration.models.event.transfer_event import TransferEvent
from registration.schema import (
    Message,
    TransferEventCreateIn,
    TransferEventFilterSchema,
    TransferEventListOut,
    TransferEventOut,
)
from registration.service.transfer_event_service import TransferEventService
from registration.utils import CustomPagination


@router.get(
    "/transfer-events",
    response={200: list[TransferEventListOut], custom_codes_4xx: Message},
    tags=TRANSFER_EVENT_TAGS,
    description="""Retrieves a paginated list of transfer events based on the provided filters.
    The endpoint allows authorized users to view and sort transfer events filtered by various criteria such as operation, facility, and status.""",
    auth=authorize("authorized_irc_user"),
)
@paginate(CustomPagination)
def list_transfer_events(
    request: HttpRequest,
    filters: TransferEventFilterSchema = Query(...),
    sort_field: str | None = "status",
    sort_order: Literal["desc", "asc"] | None = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[TransferEvent]:
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return TransferEventService.list_transfer_events(sort_field, sort_order, filters)


@router.post(
    "/transfer-events",
    response={201: TransferEventOut, custom_codes_4xx: Message},
    tags=TRANSFER_EVENT_TAGS,
    description="""Creates a new transfer event.""",
    auth=authorize("cas_director_analyst"),
)
def create_transfer_event(
    request: HttpRequest,
    payload: TransferEventCreateIn,
) -> tuple[Literal[201], TransferEvent]:
    return 201, TransferEventService.create_transfer_event(
        get_current_user_guid(request), payload
    )
