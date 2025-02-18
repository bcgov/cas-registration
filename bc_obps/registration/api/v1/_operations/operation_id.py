from typing import Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATION_TAGS
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.operation_service import OperationService
from common.api.utils import get_current_user_guid
from registration.api.router import router
from registration.models import Operation
from registration.schema.v1 import (
    OperationUpdateIn,
    OperationOut,
    OperationUpdateOut,
)
from registration.schema.generic import Message


@router.get(
    "/v1/operations/{operation_id}",
    response={200: OperationOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the details of a specific operation by its ID. The endpoint checks if the current user is authorized to access the operation.
    Industry users can only access operations they are permitted to view. If an unauthorized user attempts to access the operation, an error is raised.""",
    auth=authorize("approved_authorized_roles"),
)
def v1_get_operation(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.get_if_authorized(get_current_user_guid(request), operation_id)


@router.put(
    "/v1/operations/{operation_id}",
    response={200: OperationUpdateOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Updates the details of a specific operation by its ID. The endpoint ensures that only authorized industry users can edit operations belonging to their operator.
    Updates are processed based on the form section being edited and can include updating basic operation details, the point of contact, or the statutory declaration document.
    If the operation is submitted (indicated by the 'submit' parameter), the status and submission date of the operation are updated accordingly.
    Unauthorized access attempts raise an error.""",
    auth=authorize("approved_industry_user"),
)
def v1_update_operation(
    request: HttpRequest, operation_id: UUID, submit: str, form_section: int, payload: OperationUpdateIn
) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.update_operation(
        get_current_user_guid(request), operation_id, submit, form_section, payload
    )
