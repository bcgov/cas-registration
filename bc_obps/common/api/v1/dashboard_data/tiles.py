from django.http import HttpRequest
from django.db.models import QuerySet
from ninja.responses import codes_4xx
from typing import List, Literal, Tuple
from uuid import UUID

from common.api.router import router
from common.constants import TAG_DASHBOARD_TILES
from common.models import DashboardData
from common.schema.v1 import DashboardDataSchemaOut

from registration.api.utils.current_user_utils import get_current_user_guid
from registration.models import AppRole
from registration.decorators import handle_http_errors
from common.permissions import authorize
from registration.schema.generic import Message
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.dashboard_service import DashboardDataService


@router.get(
    "/dashboard-data",
    response={200: List[DashboardDataSchemaOut], codes_4xx: Message},
    url_name="list_dashboard_data",
    tags=TAG_DASHBOARD_TILES,
    auth=authorize("authorized_roles"),
)
@handle_http_errors()
def list_dashboard_data(
    request: HttpRequest,
    dashboard: Literal[
        'all', 'administration', 'bciers', 'registration-operation-detail', 'registration', 'reporting', 'coam'
    ],
) -> Tuple[Literal[200], QuerySet[DashboardData]]:
    role = ""
    user_guid: UUID = get_current_user_guid(request)
    if dashboard != "all":  # if dashboard is not equal to "all" then get role from AppRole
        app_role: AppRole = UserDataAccessService.get_app_role(user_guid)
        role = app_role.role_name
    data = DashboardDataService.get_dashboard_data_by_name_for_role(dashboard, user_guid, role)

    return 200, data
