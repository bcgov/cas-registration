from typing import Literal, Tuple
from uuid import UUID

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from registration.api.router import router
from registration.constants import OPERATION_TAGS
from registration.models.contact import Contact
from registration.schema import (
    Message,
    OperationRepresentativeIn,
    OperationRepresentativeOut,
    OperationRepresentativeRemove,
)
from registration.service.operation_service import OperationService


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
) -> tuple[Literal[201], Contact]:
    return 201, OperationService.create_operation_representative(
        get_current_user_guid(request), operation_id, payload
    )


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
) -> tuple[Literal[200], OperationRepresentativeRemove]:
    removed_id = OperationService.remove_operation_representative(
        get_current_user_guid(request),
        operation_id,
        payload.id,  # type: ignore
    )

    return 200, OperationRepresentativeRemove(id=removed_id)
