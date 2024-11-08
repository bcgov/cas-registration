from registration.models.operation import Operation
from registration.models import Facility
from django.db.models import QuerySet
from uuid import UUID
from ninja.types import DictStrAny


class FacilityDataAccessService:
    @classmethod
    def get_current_facilities_by_operation(cls, operation: Operation) -> QuerySet[Facility]:
        return Facility.objects.filter(
            designated_operations__end_date__isnull=True, designated_operations__operation=operation
        ).all()

    @classmethod
    def get_by_id(cls, facility_id: UUID) -> Facility:
        return Facility.objects.get(id=facility_id)

    @classmethod
    def create_facility(
        cls,
        user_guid: UUID,
        facility_data: DictStrAny,
    ) -> Facility:
        facility = Facility.objects.create(
            **facility_data,
            created_by_id=user_guid,
        )
        facility.set_create_or_update(user_guid)
        return facility

    @classmethod
    def update_facility(
        cls,
        facility_id: UUID,
        user_guid: UUID,
        facility_data: DictStrAny,
    ) -> Facility:
        facility = cls.get_by_id(facility_id)
        for key, value in facility_data.items():
            setattr(facility, key, value)
        facility.set_create_or_update(user_guid)
        facility.save()
        return facility
