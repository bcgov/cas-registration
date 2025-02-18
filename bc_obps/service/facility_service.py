from typing import Optional
from django.db.models import QuerySet
from uuid import UUID
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from service.data_access_service.facility_designated_operation_timeline_service import (
    FacilityDesignatedOperationTimelineDataAccessService,
)
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.facility_service import FacilityDataAccessService
from registration.models import Facility
from registration.schema.v1.facility import FacilityIn
from service.data_access_service.well_authorization_number_service import WellAuthorizationNumberDataAccessService

from service.data_access_service.operation_service import OperationDataAccessService
from registration.constants import UNAUTHORIZED_MESSAGE
from service.data_access_service.address_service import AddressDataAccessService
from registration.models.operation import Operation
from registration.models import User
from registration.models import WellAuthorizationNumber
from registration.enums.enums import OperationTypes

from django.db import transaction
from django.utils import timezone
from registration.models import Address


class FacilityService:
    @classmethod
    def check_user_access(cls, user_guid: UUID, operation: Operation) -> None:
        """
        Assesses whether a user has access to a given operation.

        This method performs the following steps:
        1. **Retrieve User:** Uses `UserDataAccessService.get_by_guid` to fetch the user instance based on the provided `user_guid`.
        2. **Check Access:** Checks if the retrieved user has access to the specified operation using `operation.user_has_access`.
        3. **Raise Unauthorized Exception:** If the user does not have access to the operation, an exception is raised with an appropriate unauthorized message.

        Parameters:
        - `user_guid` (UUID): The unique identifier of the user whose access is being checked.
        - `operation` (Operation): The operation instance to which access is being validated.

        Raises:
        - `Exception`: If the user does not have access to the operation, an exception is raised with the message defined in `UNAUTHORIZED_MESSAGE`.
        """
        # Retrieve the user instance based on the provided user_guid
        user: User = UserDataAccessService.get_by_guid(user_guid)

        # Check if the user has access to the specified operation
        if not operation.user_has_access(user.user_guid):
            # Raise an exception if access is denied
            raise Exception(UNAUTHORIZED_MESSAGE)

    @classmethod
    def prepare_facility_data(cls, payload: FacilityIn) -> dict:
        """
        Prepares facility data from the provided payload for further processing or database operations.

        This method performs the following steps:
        1. **Extract Data:** Extracts relevant fields from the `payload` (an instance of `FacilityIn`) to prepare a dictionary of facility data.
        2. **Include Specific Fields:** The method specifically includes fields such as 'name', 'type', 'latitude_of_largest_emissions', and 'longitude_of_largest_emissions'.

        Parameters:
        - `payload` (FacilityIn): The data payload containing facility details that need to be processed.

        Returns:
        - `dict`: A dictionary containing the extracted facility data.
        """
        # Prepare a dictionary of facility data by including specified fields from the payload
        return payload.dict(
            include={
                'name',
                'type',
                'is_current_year',
                'starting_date',
                'latitude_of_largest_emissions',
                'longitude_of_largest_emissions',
                'operation_id',
            }
        )

    @classmethod
    def build_address(cls, payload: FacilityIn, exclude_none: bool = True) -> dict:
        """Helper function to create an address model from payload data."""
        address_data = payload.dict(
            include={'street_address', 'municipality', 'province', 'postal_code'}, exclude_none=exclude_none
        )
        return address_data

    @classmethod
    def create_address(cls, address_data: dict) -> Optional[Address]:
        """Helper function to create an address model from payload data."""
        return AddressDataAccessService.create_address(address_data)

    @classmethod
    def handle_well_authorization_numbers(cls, user_guid: UUID, payload: FacilityIn, facility: Facility) -> None:
        """
        Helper function to process and set well authorization numbers for a facility.

        This method handles the addition and removal of well authorization numbers for a given facility based on
        the provided payload. It ensures that there are no duplicate well authorization numbers in the new set
        and updates the facility's well authorization numbers accordingly.

        Args:
            user_guid (UUID): The GUID of the user making the changes.
            payload (FacilityIn): The payload containing the new well authorization numbers.
            facility (Facility): The facility object to be updated.

        Raises:
            Exception: If there are duplicate well authorization numbers in the new set.
        """
        # Extract existing well authorization numbers from the facility
        existing_numbers_set = set(
            facility.well_authorization_numbers.values_list('well_authorization_number', flat=True)
        )
        new_numbers = payload.well_authorization_numbers

        # Check for duplicates within the new_numbers
        if len(new_numbers) != len(set(new_numbers)):
            raise Exception("Well Authorization Number: Duplicates are not allowed.")

        # Convert existing numbers to a queryset for filtering
        existing_numbers_queryset = WellAuthorizationNumber.objects.filter(
            well_authorization_number__in=existing_numbers_set
        )

        # Numbers to add
        numbers_to_add = set(new_numbers) - existing_numbers_set

        # Add new numbers
        if numbers_to_add:
            for number in numbers_to_add:
                facility.well_authorization_numbers.add(
                    WellAuthorizationNumberDataAccessService.create_well_authorization_number(user_guid, number)
                )

        # Numbers to remove
        numbers_to_remove = existing_numbers_set - set(new_numbers)

        # Archive old numbers
        if numbers_to_remove:
            numbers_to_archive: QuerySet[WellAuthorizationNumber] = existing_numbers_queryset.filter(
                well_authorization_number__in=numbers_to_remove
            )
            for n in numbers_to_archive:
                n.set_archive(user_guid)

    @classmethod
    def get_if_authorized(cls, user_guid: UUID, facility_id: UUID) -> Facility:
        """Retrieve a facility if the user is authorized to access it."""
        facility: Facility = FacilityDataAccessService.get_by_id(facility_id)
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if user.is_industry_user():
            owner: Operation = facility.current_designated_operation
            if not owner.user_has_access(user.user_guid):
                raise Exception(UNAUTHORIZED_MESSAGE)
        return facility

    @classmethod
    @transaction.atomic()
    def create_facility_with_designated_operation(cls, user_guid: UUID, payload: FacilityIn) -> Facility:
        """Create a facility with designated operation details."""
        from service.operation_service_v2 import OperationServiceV2

        operation = OperationServiceV2.get_if_authorized_v2(user_guid, payload.operation_id, ['id', 'operator_id'])

        # Validate that SFO and EIO can only have one facility
        if operation.facilities.count() > 0 and operation.type != OperationTypes.LFO.value:
            raise Exception(
                "This type of operation (SFO or EIO) can only have one facility, this page should not be accessible"
            )

        facility_data = cls.prepare_facility_data(payload)
        address_data = cls.build_address(payload)
        if address_data:
            facility_data['address'] = cls.create_address(address_data)

        facility = FacilityDataAccessService.create_facility(user_guid, facility_data)
        FacilityDesignatedOperationTimelineDataAccessService.create_facility_designated_operation_timeline(
            user_guid, {'facility': facility, 'operation': operation, 'start_date': timezone.now()}
        )

        cls.handle_well_authorization_numbers(user_guid, payload, facility)

        return facility

    @classmethod
    @transaction.atomic()
    def update_facility(cls, user_guid: UUID, facility_id: UUID, payload: FacilityIn) -> Facility:
        """
        Checks user access and, if authorized, updates a facility with new data.

        Parameters:
        - user_guid (UUID): The GUID of the user making the update request.
        - facility_id (UUID): The ID of the facility to be updated.
        - payload (FacilityIn): The new data for updating the facility.

        Returns:
        - Facility: The updated facility instance.
        """
        # Retrieve the operation object using the operation ID from the payload
        operation = OperationDataAccessService.get_by_id(payload.operation_id)

        # Check if the user has access to update the given operation
        cls.check_user_access(user_guid, operation)

        # Retrieve the facility object using the provided facility ID
        facility: Facility = FacilityDataAccessService.get_by_id(facility_id)

        # Prepare the facility data for updating, based on the provided payload
        facility_data = cls.prepare_facility_data(payload)

        # Update the address associated with the facility, if provided
        address_data = cls.build_address(payload, False)
        if any(address_data.values()):  # if any address data is provided
            address = AddressDataAccessService.upsert_address_from_data(address_data, facility.address_id)
            facility.address = address
            facility.save(update_fields=['address_id'])
        else:
            existing_address = facility.address
            if existing_address:
                facility.address = None
                facility.save(update_fields=['address'])
                # facility has an address and the payload has no address data, remove the address
                existing_address.delete()

        # Update the facility in the data access layer with the new data
        facility = FacilityDataAccessService.update_facility(facility_id, user_guid, facility_data)

        # Process well authorization numbers and link them to the facility
        cls.handle_well_authorization_numbers(user_guid, payload, facility)

        # Return the updated facility instance
        return facility

    @classmethod
    @transaction.atomic()
    def create_facilities_with_designated_operations(cls, user_guid: UUID, payload: list[FacilityIn]) -> list[Facility]:
        facilities = []
        for facility_data in payload:
            facilities.append(cls.create_facility_with_designated_operation(user_guid, facility_data))
        return facilities

    @classmethod
    def generate_bcghg_id(cls, user_guid: UUID, facility_id: UUID) -> BcGreenhouseGasId:
        facility = FacilityService.get_if_authorized(user_guid, facility_id)
        facility.generate_unique_bcghg_id(user_guid=user_guid)
        if facility.bcghg_id is None:
            raise Exception('Failed to create a BCGHG ID for the facility.')
        facility.save(update_fields=['bcghg_id'])

        return facility.bcghg_id

    @classmethod
    @transaction.atomic()
    def update_operation_for_facility(cls, user_guid: UUID, facility: Facility, operation_id: UUID) -> Facility:
        """
        Update the operation for the facility
        At the time of implementation, this is only used for transferring facilities between operations and,
        is only available to cas_analyst users
        """

        user = UserDataAccessService.get_by_guid(user_guid)
        if not user.is_cas_analyst():
            raise Exception(UNAUTHORIZED_MESSAGE)
        facility.operation_id = operation_id
        facility.save(update_fields=["operation_id"])
        return facility
