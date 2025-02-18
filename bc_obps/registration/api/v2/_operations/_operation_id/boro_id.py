from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.models.bc_obps_regulated_operation import BcObpsRegulatedOperation
from registration.schema.v2.operation import OperationBoroIdOut
from service.operation_service_v2 import OperationServiceV2
from registration.constants import V2
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.api.router import router
from registration.schema.generic import Message


@router.patch(
    "/operations/{uuid:operation_id}/boro-id",
    response={200: OperationBoroIdOut, custom_codes_4xx: Message},
    tags=V2,
    description="""Generates and returns a BORO ID for the operation if the operation is of an appropriate type and status and doesn't already have a BORO ID.""",
    auth=authorize('cas_director'),
)
def operation_boro_id(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], BcObpsRegulatedOperation | None]:
    return 200, OperationServiceV2.generate_boro_id(
        get_current_user_guid(request),
        operation_id,
    )
