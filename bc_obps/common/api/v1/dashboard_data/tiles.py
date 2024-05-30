from django.http import HttpRequest
from django.db.models import QuerySet
from typing import List, Literal, Tuple
from uuid import UUID

from common.api.router import router
from common.constants import TAG_DASHBOARD_TILES
from common.models import DashboardData
from common.schema.v1 import DashboardDataSchemaOut

from registration.api.utils.current_user_utils import get_current_user_guid
from registration.models import AppRole, UserOperator
from registration.decorators import authorize, handle_http_errors

from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.dashboard_service import DashboardDataService


#  🚀 http://localhost:8000/api/docs; 
#  🛸 http://localhost:8000/api/common/dashboard-data?dashboard=all
@router.get("/dashboard-data", response=List[DashboardDataSchemaOut], url_name="list_dashboard_data", tags=TAG_DASHBOARD_TILES)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def list_dashboard_data(request: HttpRequest, dashboard: Literal['all', 'bciers','registration-operation-detail', 'registration', 'reporting']) -> Tuple[Literal[200], QuerySet[DashboardData]]:
    query_dict= request.GET
    dashboard = query_dict.get('dashboard', default=None)
    role = "";

    if dashboard is None:
        # Handle missing 'dashboard' parameter
        return 400, []  

    if dashboard != "all":  # if dashboard is not equal to "all" then get role from AppRole
        user_guid: UUID = get_current_user_guid(request)
        app_role: AppRole = UserDataAccessService.get_app_role(user_guid)
        role= app_role.role_name
    data= DashboardDataService.get_dashboard_data_by_name_for_role(dashboard, role)
   
    return 200, data 
