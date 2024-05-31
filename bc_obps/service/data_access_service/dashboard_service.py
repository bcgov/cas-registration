from typing import Optional
from django.db.models import QuerySet
from django.db.models import Q
from common.models import DashboardData
from common.schema.v1 import DashboardDataSchemaOut

import logging
logger = logging.getLogger(__name__)

class DashboardDataService:
    @classmethod
    def get_dashboard_data_by_name_for_role(cls, dashboard: str = None, role: Optional[str] = None) -> QuerySet[DashboardData]:
        """
        Fetches dashboard data filtered by dashboard name and user role.

        Args:
            dashboard (str): The name of the dashboard to filter by. Use "all" to fetch all dashboards.
            role (Optional[str]): The user role to filter by. The role should be contained within the access_roles.

        Returns:
            QuerySet[DashboardData]: A queryset of filtered DashboardData objects.
        """
        try:
            fields = DashboardDataSchemaOut.Meta.fields
            query = DashboardData.objects.only(*fields)
            if dashboard == "all":
                return query
            else:
                query = query.filter(Q(data__dashboard=dashboard) & Q(data__access_roles__contains=role))

            return query
        
        except Exception as exc:
            # Log the exception if needed
            logger.error(f'Logger: Exception in get_dashboard_data_by_name_for_role {str(exc)}')
            return DashboardData.objects.none()
                     