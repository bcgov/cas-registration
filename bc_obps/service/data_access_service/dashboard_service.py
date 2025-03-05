import logging
from typing import Optional
from uuid import UUID
from django.db.models import QuerySet
from django.db.models import Q
from common.models import DashboardData
from common.schema import DashboardDataSchemaOut
from service.data_access_service.user_service import UserDataAccessService

logger = logging.getLogger(__name__)


class DashboardDataService:
    @classmethod
    def get_dashboard_data_by_name_for_role(
        cls, dashboard: str, user_guid: UUID, role: Optional[str] = None
    ) -> QuerySet[DashboardData]:
        """
        Fetches dashboard data filtered by dashboard name and user role.

        Args:
            dashboard (str): The name of the dashboard to filter by. Use "all" to fetch all dashboards.
            user_guid (UUID): The user guid to filter by.
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
                # Check if the user is an approved admin user operator
                if role == "industry_user":
                    approved_admin: bool = UserDataAccessService.is_user_an_approved_admin_user_operator(user_guid)[
                        "approved"
                    ]
                    role = "industry_user_admin" if approved_admin else "industry_user"
                query = query.filter(Q(data__dashboard=dashboard) & Q(data__access_roles__contains=role))

            return query

        except Exception as exc:
            # Log the exception if needed
            logger.error(f'Logger: Exception in get_dashboard_data_by_name_for_role {str(exc)}')
            return DashboardData.objects.none()
