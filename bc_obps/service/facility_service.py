from typing import Optional
from django.db.models import QuerySet
from uuid import UUID
from registration.schema.v1.facility import FacilityFilterSchema
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.facility_service import FacilityDataAccessService
from ninja import Query
from registration.models import Facility
from registration.schema.v1.facility import FacilityIn
from service.data_access_service.well_authorization_number_service import WellAuthorizationNumberDataAccessService
from service.data_access_service.facility_ownership_timeline_service import FacilityOwnershipTimelineDataAccessService
from service.data_access_service.operation_service import OperationDataAccessService
from registration.constants import UNAUTHORIZED_MESSAGE
from service.data_access_service.address_service import AddressDataAccessService
from registration.models.operation import Operation
from registration.models import User
from django.db import transaction
from django.utils import timezone


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

    @classmethod
    def get_if_authorized(cls, user_guid: UUID, facility_id: UUID) -> Facility:
        facility: Facility = FacilityDataAccessService.get_by_id(facility_id)
        owner: Operation = facility.current_owner
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if user.is_industry_user() and not owner.user_has_access(user.user_guid):
            raise Exception(UNAUTHORIZED_MESSAGE)
        return facility

    @classmethod
    @transaction.atomic()
    def create_facility_with_ownership(cls, user_guid: UUID, payload: FacilityIn) -> Facility:
        operation = OperationDataAccessService.get_by_id(payload.operation_id)
        # Just to be extra safe, we should check if the user has access to the operation
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if not operation.user_has_access(user.user_guid):
            raise Exception(UNAUTHORIZED_MESSAGE)
        # if any of address data generate one address and keep it to pass to the facility
        facility_data: dict = payload.dict(
            include={
                'name',
                'type',
                'is_current_year',
                'starting_date',
                'latitude_of_largest_emissions',
                'longitude_of_largest_emissions',
            }
        )
        address_data = payload.dict(
            include={'street_address', 'municipality', 'province', 'postal_code'}, exclude_none=True
        )
        if address_data:
            address = AddressDataAccessService.create_address(address_data)
            facility_data['address'] = address
        facility = FacilityDataAccessService.create_facility(user_guid, facility_data)
        FacilityOwnershipTimelineDataAccessService.create_facility_ownership_timeline(
            user_guid, {'facility': facility, 'operation': operation, 'start_date': timezone.now()}
        )

        well_authorization_numbers = []
        for number in payload.well_authorization_numbers:
            well_authorization_numbers.append(
                WellAuthorizationNumberDataAccessService.create_well_authorization_number(user_guid, number)
            )
        if well_authorization_numbers:
            facility.well_authorization_numbers.set(well_authorization_numbers)
        return facility

    @classmethod
    @transaction.atomic()
    def create_facilities_with_ownership(cls, user_guid: UUID, payload: list[FacilityIn]) -> list[Facility]:
        facilities = []
        for facility_data in payload:
            facilities.append(cls.create_facility_with_ownership(user_guid, facility_data))
        return facilities
