from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.models.contact import Contact
from registration.schema import (
    OperationRepresentativeIn,
    OperationRepresentativeOut,
    OperationRepresentativeRemove,
    Message,
)
from service.operation_service import OperationService
from registration.constants import OPERATION_TAGS
from common.api.utils import get_current_user_guid
from registration.api.router import router
from common.permissions import authorize
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.post(
    "/operations/{uuid:operation_id}/registration/operation-representative",
    response={201: OperationRepresentativeOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Updates an operation with operation representative(s). User may create new contact to use as representatives if desired or use existing contacts.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize("approved_industry_user"),
)
def create_operation_representative(
    request: HttpRequest, operation_id: UUID, payload: OperationRepresentativeIn
) -> Tuple[Literal[201], Contact]:
    return 201, OperationService.create_operation_representative(get_current_user_guid(request), operation_id, payload)


@router.put(
    "/operations/{uuid:operation_id}/registration/operation-representative",
    response={200: OperationRepresentativeOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Removes operation representative from an operation.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize("approved_industry_user"),
)
def remove_operation_representative(
    request: HttpRequest, operation_id: UUID, payload: OperationRepresentativeRemove
) -> Tuple[Literal[200], OperationRepresentativeRemove]:
    return 200, OperationService.remove_operation_representative(get_current_user_guid(request), operation_id, payload)
