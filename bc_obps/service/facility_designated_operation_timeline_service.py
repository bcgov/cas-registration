from typing import Optional
from django.db.models import QuerySet
from uuid import UUID
from registration.schema.v1.facility_designated_operation_timeline import (
    FacilityDesignatedOperationTimelineFilterSchema,
)
from service.data_access_service.user_service import UserDataAccessService
from ninja import Query

from registration.models import User
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from service.user_operator_service import UserOperatorService


class FacilityDesignatedOperationTimelineService:
    @classmethod
    def get_timeline_by_operation_id(
        cls, user: User, operation_id: UUID
    ) -> QuerySet[FacilityDesignatedOperationTimeline]:
        if user.is_industry_user():
            UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
        return (
            FacilityDesignatedOperationTimeline.objects.all()
            .filter(
                operation__id=operation_id,
            )
            .distinct()
        )

    @classmethod
    def list_timeline_by_operation_id(
        cls,
        user_guid: UUID,
        operation_id: UUID,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: FacilityDesignatedOperationTimelineFilterSchema = Query(...),
    ) -> QuerySet[FacilityDesignatedOperationTimeline]:
        """List facilities belonging to a specific operation with specified sorting and filtering."""
        user = UserDataAccessService.get_by_guid(user_guid)
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = cls.get_timeline_by_operation_id(user, operation_id)
        return filters.filter(base_qs).order_by(sort_by)
