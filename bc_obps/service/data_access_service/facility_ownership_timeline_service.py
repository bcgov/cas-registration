from uuid import UUID
from registration.models.facility_ownership_timeline import FacilityOwnershipTimeline
from ninja.types import DictStrAny


class FacilityOwnershipTimelineDataAccessService:
    @classmethod
    def create_facility_ownership_timeline(
        cls,
        user_guid: UUID,
        facility_ownership_timeline_data: DictStrAny,
    ) -> FacilityOwnershipTimeline:
        facility_ownership_timeline = FacilityOwnershipTimeline.objects.create(
            **facility_ownership_timeline_data,
            created_by_id=user_guid,
        )
        facility_ownership_timeline.set_create_or_update(user_guid)
        return facility_ownership_timeline
