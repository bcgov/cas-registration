from uuid import UUID
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
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
        return facility_designated_operation_timeline
