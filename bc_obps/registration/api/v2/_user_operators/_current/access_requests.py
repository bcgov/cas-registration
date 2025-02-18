from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import USER_OPERATOR_TAGS
from registration.models import UserOperator
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from django.db.models import QuerySet
from registration.schema.v1 import ExternalDashboardUsersTileData
from registration.schema.generic import Message
from typing import List, Literal, Tuple
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx


# "current" refers to the current user-operator (we look up the current user-operator via the current user)
@router.get(
    "/user-operators/current/access-requests",
    response={200: List[ExternalDashboardUsersTileData], custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Retrieves the list of access requests to the current user's operator. The current user is an industry user admin.
    The endpoint returns the access requests that need to be approved or declined by the admin.
    The list is filtered based on the business GUID of the current user and the associated operator.""",
    auth=authorize("approved_industry_admin_user"),
)
def get_current_user_operator_access_requests(request: HttpRequest) -> Tuple[Literal[200], QuerySet[UserOperator]]:
    return 200, UserOperatorDataAccessService.get_an_operators_user_operators_by_user_guid(
        get_current_user_guid(request)
    ).order_by("-status", "-user_friendly_id")
