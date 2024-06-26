from registration.models.facility_ownership_timeline import FacilityOwnershipTimeline
from ninja.types import DictStrAny


class FacilityOwnershipTimelineDataAccessService:
    @classmethod
    def create_facility_ownership_timeline(
        cls,
        facility_ownership_timeline_data: DictStrAny,
    ) -> FacilityOwnershipTimeline:
        facility_ownership_timeline = FacilityOwnershipTimeline.objects.create(
            **facility_ownership_timeline_data,
        )
        return facility_ownership_timeline
