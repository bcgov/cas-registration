from uuid import UUID
from zoneinfo import ZoneInfo
from registration.constants import UNAUTHORIZED_MESSAGE
from django.db import transaction
from registration.decorators import authorize
from datetime import datetime
from django.core.exceptions import ValidationError

from registration.decorators import authorize
from service.operation_service import OperationService
from registration.api.utils.current_user_utils import get_current_user


from registration.decorators import handle_http_errors

from registration.api.api_base import router
from registration.models import (
    AppRole,
    UserOperator,
)
from registration.schema import (
    OperationUpdateIn,
    OperationOut,
    OperationUpdateOut,
    Message,
)

from ninja.responses import codes_4xx


@router.get(
    "/operations/{operation_id}",
    response={200: OperationOut, codes_4xx: Message},
    url_name="get_operation",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def get_operation(request, operation_id: UUID):
    return 200, OperationService.get_operation_if_authorized(get_current_user(request), operation_id)


@router.put(
    "/operations/{operation_id}", response={200: OperationUpdateOut, codes_4xx: Message}, url_name="update_operation"
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def update_operation(request, operation_id: UUID, submit: str, form_section: int, payload: OperationUpdateIn):
    return 200, OperationService.update_operation(
        get_current_user(request).user_guid, operation_id, submit, form_section, payload
    )
