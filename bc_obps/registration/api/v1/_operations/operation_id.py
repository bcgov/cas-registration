from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.constants import OPERATION_TAGS
from registration.decorators import authorize

from service.operation_service import OperationService
from registration.api.utils.current_user_utils import get_current_user_guid


from registration.decorators import handle_http_errors

from registration.api.router import router
from registration.models import (
    AppRole,
    Operation,
    UserOperator,
)
from registration.schema.v1 import (
    OperationUpdateIn,
    OperationOut,
    OperationUpdateOut,
)
from registration.schema.generic import Message
from ninja.responses import codes_4xx


@router.get(
    "/operations/{operation_id}",
    response={200: OperationOut, codes_4xx: Message},
    url_name="get_operation",
    tags=OPERATION_TAGS,
    description="""Retrieves the details of a specific operation by its ID. The endpoint checks if the current user is authorized to access the operation.
    Industry users can only access operations they are permitted to view. If an unauthorized user attempts to access the operation, an error is raised.""",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def get_operation(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.get_if_authorized(get_current_user_guid(request), operation_id)


@router.put(
    "/operations/{operation_id}",
    response={200: OperationUpdateOut, codes_4xx: Message},
    url_name="update_operation",
    tags=OPERATION_TAGS,
    description="""Updates the details of a specific operation by its ID. The endpoint ensures that only authorized industry users can edit operations belonging to their operator.
    Updates are processed based on the form section being edited and can include updating basic operation details, the point of contact, or the statutory declaration document.
    If the operation is submitted (indicated by the 'submit' parameter), the status and submission date of the operation are updated accordingly.
    Unauthorized access attempts raise an error.""",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def update_operation(
    request: HttpRequest, operation_id: UUID, submit: str, form_section: int, payload: OperationUpdateIn
) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.update_operation(
        get_current_user_guid(request), operation_id, submit, form_section, payload
    )
