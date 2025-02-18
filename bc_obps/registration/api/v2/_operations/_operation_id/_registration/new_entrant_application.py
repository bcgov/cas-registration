from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.constants import OPERATION_TAGS

from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.v2.operation import (
    OperationUpdateOut,
    OperationNewEntrantApplicationIn,
    OperationNewEntrantApplicationOut,
)
from service.operation_service_v2 import OperationServiceV2
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from registration.models import Operation
from registration.api.router import router
from registration.schema.generic import Message


##### GET #####


@router.get(
    "/operations/{uuid:operation_id}/registration/new-entrant-application",
    response={200: OperationNewEntrantApplicationOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the new entrant application document of a specific operation by its ID. The endpoint checks if the current user is authorized to access the operation.
    Industry users can only access operations they are permitted to view. If an unauthorized user attempts to access the operation, an error is raised.""",
    auth=authorize("approved_authorized_roles"),
    exclude_none=True,  # Exclude None values from the response so that frontend can uses default value for date_of_first_shipment
)
def get_operation_new_entrant_application(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    return 200, OperationServiceV2.get_if_authorized_v2(
        get_current_user_guid(request), operation_id, ['id', 'operator_id']
    )


@router.put(
    "/operations/{uuid:operation_id}/registration/new-entrant-application",
    response={200: OperationUpdateOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="Creates or replaces a new entrant application document for an Operation",
    auth=authorize("approved_industry_user"),
)
def create_or_replace_new_entrant_application(
    request: HttpRequest, operation_id: UUID, payload: OperationNewEntrantApplicationIn
) -> Tuple[Literal[200], Operation]:
    return 200, OperationServiceV2.create_or_replace_new_entrant_application(
        get_current_user_guid(request), operation_id, payload
    )
