from ninja import Schema, ModelSchema
from registration.models import FacilitySnapshot
from typing import Optional
from datetime import datetime
from uuid import UUID


class FacilitySnapshotOut(ModelSchema):
    """Schema for outputting FacilitySnapshot data"""

    facility_id: UUID
    operation_id: UUID

    class Meta:
        model = FacilitySnapshot
        fields = [
            'id',
            'name',
            'is_current_year',
            'starting_date',
            'type',
            'street_address',
            'municipality',
            'province',
            'postal_code',
            'swrs_facility_id',
            'bcghg_id',
            'latitude_of_largest_emissions',
            'longitude_of_largest_emissions',
            'well_authorization_numbers',
            'snapshot_timestamp',
        ]


class FacilitySnapshotListOut(Schema):
    """Schema for listing facility snapshots"""

    facility_id: UUID
    facility_name: str
    snapshot_timestamp: datetime
    type: str
    bcghg_id: Optional[str] = None
