from django.http import HttpRequest
from common.api.router import router
from common.constants import TAG_DASHBOARD_TILES
from service.data_access_service.dashboard_service import DashboardDataService
from common.models import DashboardData
from common.schema.v1 import DashboardDataSchemaOut

from typing import List, Literal, Tuple
from django.db.models import QuerySet



@router.get("/dashboard-data", response=List[DashboardDataSchemaOut], url_name="list_dashboard_data", tags=TAG_DASHBOARD_TILES)
#TO DO @authorize
def list_dashboard_data(request: HttpRequest) -> Tuple[Literal[200], QuerySet[DashboardData]]:
    query_dict= request.GET
    dashboard = query_dict.get('dashboard', default=None)
    role = query_dict.get('role', default=None)
    # ex: http://localhost:8000/api/common/dashboard-data?dashboard=all
    # ex: http://localhost:8000/api/common/dashboard-data?dashboard=bciers&role=cas_admin
    return 200, DashboardDataService.get_dashboard_data_by_name_for_role(dashboard, role)

