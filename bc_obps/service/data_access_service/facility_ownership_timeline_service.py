from uuid import UUID
from registration.models.facility_designated_operator_timeline import FacilityDesignatedOperationTimeline
from ninja.types import DictStrAny


class FacilityDesignatedOperationTimelineDataAccessService:
    @classmethod
    def create_facility_ownership_timeline(
        cls,
        user_guid: UUID,
        facility_ownership_timeline_data: DictStrAny,
    ) -> FacilityDesignatedOperationTimeline:
        facility_ownership_timeline = FacilityDesignatedOperationTimeline.objects.create(
            **facility_ownership_timeline_data,
            created_by_id=user_guid,
        )
        facility_ownership_timeline.set_create_or_update(user_guid)
        return facility_ownership_timeline
