from registration.models.operation import Operation
from service.user_operator_service import UserOperatorService
from registration.models import Facility, User
from django.db.models import QuerySet
from uuid import UUID
from ninja.types import DictStrAny


class FacilityDataAccessService:
    @classmethod
    def get_all_facilities_for_user(cls, user: User) -> QuerySet[Facility]:
        queryset = Facility.objects.all()
        if user.is_irc_user():
            # IRC users can see all facilities
            return queryset
        else:
            # Industry users can only see operations associated with their own operator and that are not ended
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            return queryset.filter(
                designated_operations__operation__operator_id=user_operator.operator_id,
                designated_operations__end_date__isnull=True,
            ).distinct()

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
