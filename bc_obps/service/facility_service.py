from typing import Optional
from django.db.models import QuerySet
from uuid import UUID
from registration.schema.v1.facility import FacilityFilterSchema
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.facility_service import FacilityDataAccessService
from ninja import Query
from registration.models import Facility


class FacilityService:
    @classmethod
    def list_facilities(
        cls,
        user_guid: UUID,
        operation_id: UUID,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: FacilityFilterSchema = Query(...),
    ) -> QuerySet[Facility]:
        user = UserDataAccessService.get_by_guid(user_guid)
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = (
            FacilityDataAccessService.get_all_facilities_for_user(user)
            .filter(ownerships__operation_id=operation_id)
            .distinct()
        )
        return filters.filter(base_qs).order_by(sort_by)
