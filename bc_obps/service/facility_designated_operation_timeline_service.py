from datetime import datetime
from typing import Optional
from django.db.models import QuerySet
from uuid import UUID
from registration.schema import FacilityDesignatedOperationTimelineFilterSchema
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
        base_queryset = FacilityDesignatedOperationTimeline.objects.filter(operation__id=operation_id).distinct()

        if user.is_industry_user():
            UserOperatorService.get_current_user_approved_user_operator_or_raise(user)

        return base_queryset

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

    @classmethod
    def get_current_timeline(
        cls, operation_id: UUID, facility_id: UUID
    ) -> Optional[FacilityDesignatedOperationTimeline]:
        return FacilityDesignatedOperationTimeline.objects.filter(
            operation_id=operation_id, facility_id=facility_id, end_date__isnull=True
        ).first()

    @classmethod
    def set_timeline_status_and_end_date(
        cls,
        timeline: FacilityDesignatedOperationTimeline,
        end_date: datetime,
    ) -> FacilityDesignatedOperationTimeline:
        timeline.end_date = end_date
        timeline.save(update_fields=["end_date"])
        return timeline
