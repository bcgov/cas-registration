from uuid import UUID
from service.user_operator_service import UserOperatorService
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.models.user import User
from django.db.models import QuerySet
from ninja.types import DictStrAny


class FacilityDesignatedOperationTimelineDataAccessService:
    @classmethod
    def create_facility_designated_operation_timeline(
        cls,
        user_guid: UUID,
        facility_designated_operation_timeline_data: DictStrAny,
    ) -> FacilityDesignatedOperationTimeline:
        facility_designated_operation_timeline = FacilityDesignatedOperationTimeline.objects.create(
            **facility_designated_operation_timeline_data,
            created_by_id=user_guid,
        )
        facility_designated_operation_timeline.set_create_or_update(user_guid)
        return facility_designated_operation_timeline

    @classmethod
    def get_timeline_by_operation_id_for_user(
        cls, user: User, operation_id: UUID
    ) -> QuerySet[FacilityDesignatedOperationTimeline]:
        # if IRC user, should see everything (no filter)
        queryset = FacilityDesignatedOperationTimeline.objects.all()
        user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
        return queryset.filter(
            operation__operator_id=user_operator.operator_id,
            operation__id=operation_id,
        ).distinct()
