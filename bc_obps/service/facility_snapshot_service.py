import logging
from typing import Optional
from uuid import UUID
from django.db import transaction
from django.db.models import QuerySet
from registration.models import Facility, FacilitySnapshot, Operation

logger = logging.getLogger(__name__)


class FacilitySnapshotService:
    @classmethod
    @transaction.atomic
    def create_facility_snapshot(
        cls,
        user_guid: UUID,
        facility: Facility,
        operation: Operation,
    ) -> FacilitySnapshot:
        """
        Create a snapshot of a facility at the time of transfer.

        Args:
            user_guid: The UUID of the user creating the snapshot
            facility: The facility to snapshot
            operation: The operation that owned the facility at snapshot time

        Returns:
            The created FacilitySnapshot instance
        """
        # Get address data if available
        address = facility.address
        street_address = address.street_address if address else None
        municipality = address.municipality if address else None
        province = address.province if address else None
        postal_code = address.postal_code if address else None

        # Get BCGHG ID if available
        bcghg_id = str(facility.bcghg_id.id) if facility.bcghg_id else None

        # Get well authorization numbers
        well_auth_numbers = list(
            facility.well_authorization_numbers.values_list('well_authorization_number', flat=True)
        )

        snapshot = FacilitySnapshot.objects.create(
            facility=facility,
            operation=operation,
            name=facility.name,
            is_current_year=facility.is_current_year,
            starting_date=facility.starting_date,
            type=facility.type,
            street_address=street_address,
            municipality=municipality,
            province=province,
            postal_code=postal_code,
            swrs_facility_id=facility.swrs_facility_id,
            bcghg_id=bcghg_id,
            latitude_of_largest_emissions=facility.latitude_of_largest_emissions,
            longitude_of_largest_emissions=facility.longitude_of_largest_emissions,
            well_authorization_numbers=well_auth_numbers,
            created_by_id=user_guid,
            updated_by_id=user_guid,
        )

        logger.info(f"Created facility snapshot {snapshot.id} for facility {facility.id} and operation {operation.id}")
        return snapshot

    @classmethod
    def get_facility_snapshots_by_operation_and_facility(
        cls,
        operation_id: UUID,
        facility_id: UUID,
    ) -> Optional[FacilitySnapshot]:
        """
        Get the facility snapshot for a specific operation and facility.
        Returns the most recent snapshot if multiple exist.

        Args:
            operation_id: The operation ID
            facility_id: The facility ID

        Returns:
            The FacilitySnapshot instance or None if not found
        """
        try:
            return (
                FacilitySnapshot.objects.filter(
                    operation_id=operation_id,
                    facility_id=facility_id,
                )
                .order_by('-snapshot_timestamp')
                .first()
            )
        except FacilitySnapshot.DoesNotExist:
            return None

    @classmethod
    def get_facility_snapshots_by_operation(
        cls,
        operation_id: UUID,
    ) -> QuerySet[FacilitySnapshot]:
        """
        Get all facility snapshots for a specific operation.

        Args:
            operation_id: The operation ID

        Returns:
            QuerySet of FacilitySnapshot instances
        """
        return FacilitySnapshot.objects.filter(operation_id=operation_id).order_by('-snapshot_timestamp')
