from uuid import UUID
from registration.service.user_operator.ListUserOperatorsService import ListUserOperatorsService

from registration.decorators import authorize, try_except_wrapper
from registration.schema import (
    UserOperatorOut,
    Message,
    UserOperatorPaginatedOut,
    IsApprovedUserOperator,
    UserOperatorIdOut,
    ExternalDashboardUsersTileData,
    PendingUserOperatorOut,
    OperatorFromUserOperatorOut,
)
from typing import List
from registration.api.api_base import router

from registration.models import (
    AppRole,
    UserOperator,
)
from ninja.responses import codes_4xx


@router.get("/user-operator-initial-requests", response=UserOperatorPaginatedOut, url_name="list_user_operators")
@authorize(AppRole.get_authorized_irc_roles())
@try_except_wrapper()
def list_user_operators(request, page: int = 1, sort_field: str = "created_at", sort_order: str = "desc"):
    return ListUserOperatorsService.list_user_operators(request, page, sort_field, sort_order)
