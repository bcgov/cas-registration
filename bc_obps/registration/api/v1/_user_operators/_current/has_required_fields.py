from typing import Dict, Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATOR_TAGS
from service.operator_service_v2 import OperatorServiceV2
from registration.decorators import handle_http_errors
from registration.schema.generic import Message
from registration.api.router import router
from registration.api.utils.current_user_utils import get_current_user_guid
from service.data_access_service.user_service import UserDataAccessService

@router.get(
    "/user-operators/current/has-required-fields",
    response={200: Dict[str, bool], 400: Message},
    tags=OPERATOR_TAGS,
    description="""
        Checks if a current user's operator has all required fields completed.
        If all required fields (as defined by the model) are completed, it returns 'True'; otherwise, it returns 'False'.
    """,
    auth=authorize("all_roles"),
)
@handle_http_errors()
def get_current_user_operator_has_required_fields(request: HttpRequest) -> Tuple[Literal[200], Dict[str, bool]]:
    # return 200, {"has_required_fields": False} 

    # Get the current user GUID from the request
    user_guid = get_current_user_guid(request)
    
    # Retrieve the operator associated with the current user
    operator = UserDataAccessService.get_operator_by_user(user_guid)
    
    # Check if the operator exists
    if not operator:
        return 200, False
    
    # Use the service to check if the operator has all required fields filled
    has_required_fields = OperatorServiceV2.has_required_fields(operator.id)
    
    if has_required_fields:
        return 200, {"has_required_fields": True}
    else:
        return 200, {"has_required_fields": False}
