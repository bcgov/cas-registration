from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.schema import Message, BcghgIdIn, BcghgIdOut
from service.operation_service import OperationService
from registration.constants import OPERATION_TAGS
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.api.router import router


@router.patch(
    "/operations/{uuid:operation_id}/bcghg-id",
    response={200: BcghgIdOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Generates and returns a BCGHG ID for the operation if the operation doesn't already have a BCGHG ID.""",
    auth=authorize('cas_director'),
)
def operation_bcghg_id(
    request: HttpRequest, operation_id: UUID, payload: BcghgIdIn
) -> Tuple[Literal[200], BcGreenhouseGasId]:
    return 200, OperationService.generate_bcghg_id(
        get_current_user_guid(request),
        operation_id,
        payload.bcghg_id if payload else None,
    )
