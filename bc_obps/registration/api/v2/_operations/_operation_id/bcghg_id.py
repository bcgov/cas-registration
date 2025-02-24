from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.schema.v2.operation import OperationBcghgIdOut
from service.operation_service_v2 import OperationServiceV2
from registration.constants import V2
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.api.router import router
from registration.schema.generic import Message


@router.patch(
    "/operations/{uuid:operation_id}/bcghg-id",
    response={200: OperationBcghgIdOut, custom_codes_4xx: Message},
    tags=V2,
    description="""Generates and returns a BCGHG ID for the operation if the operation doesn't already have a BCGHG ID.""",
    auth=authorize('cas_director'),
)
def operation_bcghg_id(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], BcGreenhouseGasId]:
    return 200, OperationServiceV2.generate_bcghg_id(
        get_current_user_guid(request),
        operation_id,
    )
