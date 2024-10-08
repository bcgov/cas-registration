from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.constants import OPERATION_TAGS
from ninja.responses import codes_4xx
from service.operation_service import OperationService
from registration.schema.v2.operation import (
    OperationUpdateOut,
    OperationStatutoryDeclarationIn,
    OperationStatutoryDeclarationOut,
)
from service.operation_service_v2 import OperationServiceV2
from common.permissions import authorize
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.models import Operation
from registration.decorators import handle_http_errors
from registration.api.router import router
from registration.schema.generic import Message


##### GET #####


@router.get(
    "/v2/operations/{uuid:operation_id}/registration/statutory-declaration",
    response={200: OperationStatutoryDeclarationOut, codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the statutory declaration document of a specific operation by its ID. The endpoint checks if the current user is authorized to access the operation.
    Industry users can only access operations they are permitted to view. If an unauthorized user attempts to access the operation, an error is raised.""",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def get_operation_statutory_declaration(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.get_if_authorized(get_current_user_guid(request), operation_id)


@router.put(
    "/v2/operations/{uuid:operation_id}/registration/statutory-declaration",
    response={200: OperationUpdateOut, codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="Creates or replaces a statutory declaration document for an Operation",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def create_or_replace_statutory_declarations(
    request: HttpRequest, operation_id: UUID, payload: OperationStatutoryDeclarationIn
) -> Tuple[Literal[200], Operation]:
    return 200, OperationServiceV2.create_or_replace_statutory_declaration(
        get_current_user_guid(request), operation_id, payload
    )
