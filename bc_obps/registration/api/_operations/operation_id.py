from typing import Literal, Tuple
from uuid import UUID
from registration.schema import OperationInformationInUpdate, OperationOut, OperationOutWithDocuments, Message
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATION_TAGS
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.operation_service import OperationService
from common.api.utils import get_current_user_guid
from registration.api.router import router
from registration.models import Operation


##### GET #####


@router.get(
    "/operations/{uuid:operation_id}",
    response={200: OperationOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the details of a specific operation by its ID. Unlike the v1 endpoint, this endpoint does not
    return the new entrant application field as it can be quite large and cause slow requests. If you need the new entrant application field,
    use the  operations/{operation_id}/registration/new-entrant-application endpoint or v1 of this endpoint""",
    exclude_none=True,
    auth=authorize("approved_authorized_roles"),
)
def get_operation(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.get_if_authorized(get_current_user_guid(request), operation_id)


@router.get(
    "/operations/{uuid:operation_id}/with-documents",
    response={200: OperationOutWithDocuments, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the details of a specific operation by its ID along with it's documents""",
    exclude_none=True,
    auth=authorize("approved_authorized_roles"),
)
def get_operation_with_documents(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.get_if_authorized(get_current_user_guid(request), operation_id)


##### PUT ######


@router.put(
    "/operations/{uuid:operation_id}",
    response={200: OperationOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="Updates the details of a specific operation by its ID.",
    auth=authorize("approved_industry_user"),
)
def update_operation(
    request: HttpRequest, operation_id: UUID, payload: OperationInformationInUpdate
) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.update_operation(get_current_user_guid(request), payload, operation_id)
