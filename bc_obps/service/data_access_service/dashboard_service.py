from typing import Optional
from django.db.models import QuerySet
from django.db.models import Q
from common.models import DashboardData
from common.schema.v1 import DashboardDataSchemaOut

##### GET #####


class DashboardDataService:
    @classmethod
    def get_dashboard_data_by_name_for_role(cls, dashboard: Optional[str] = None, role: Optional[str] = None) -> QuerySet[DashboardData]:
        if dashboard == "all":
            dashboard_data= DashboardData.objects.only(*DashboardDataSchemaOut.Meta.fields)
        else:
            dashboard_data= DashboardData.objects.only(*DashboardDataSchemaOut.Meta.fields).filter(Q(data__dashboard=dashboard) & Q(data__access_roles__contains=role))
        return dashboard_data