import pytest
from model_bakery import baker
from registration.models import (
    WellAuthorizationNumber,
    BcGreenhouseGasId,
    Operation,
)
from service.facility_snapshot_service import FacilitySnapshotService


pytestmark = pytest.mark.django_db


class TestCreateFacilitySnapshot:
    @staticmethod
    def test_create_facility_snapshot_copies_fields():
        """Ensure FacilitySnapshotService.create_facility_snapshot copies expected fields."""
        # Create director and operation with REGISTERED status
        director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            status=Operation.Statuses.REGISTERED,
        )

        # Create BCGHG ID following test_facility_service pattern
        bcghg = BcGreenhouseGasId.objects.create(
            id='11234567890',
            issued_by_id=director.user_guid,
            comments='test',
        )

        # Create facility using recipe with all fields
        facility = baker.make_recipe(
            'registration.tests.utils.facility',
            operation=operation,
            bcghg_id=bcghg,
            name='Test Facility',
            is_current_year=True,
            type='Single Facility',
            swrs_facility_id=99,
            latitude_of_largest_emissions=48.123456,
            longitude_of_largest_emissions=-123.123456,
        )

        # Add well authorization numbers
        wan1 = WellAuthorizationNumber.objects.create(well_authorization_number=111111)
        wan2 = WellAuthorizationNumber.objects.create(well_authorization_number=222222)
        facility.well_authorization_numbers.set([wan1, wan2])

        # Create a user for audit fields
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')

        # Call the service
        snapshot = FacilitySnapshotService.create_facility_snapshot(user.user_guid, facility, operation)

        # Refresh from DB and assert values copied
        snapshot.refresh_from_db()

        assert snapshot.facility_id == facility.id
        assert snapshot.operation_id == operation.id
        assert snapshot.name == facility.name
        assert snapshot.is_current_year == facility.is_current_year
        assert snapshot.starting_date == facility.starting_date
        assert snapshot.type == facility.type

        assert snapshot.street_address == facility.address.street_address
        assert snapshot.municipality == facility.address.municipality
        assert snapshot.province == facility.address.province
        assert snapshot.postal_code == facility.address.postal_code

        assert snapshot.swrs_facility_id == facility.swrs_facility_id
        assert snapshot.bcghg_id == str(bcghg.id)

        assert float(snapshot.latitude_of_largest_emissions) == float(facility.latitude_of_largest_emissions)
        assert float(snapshot.longitude_of_largest_emissions) == float(facility.longitude_of_largest_emissions)

        assert sorted(snapshot.well_authorization_numbers) == sorted(
            [
                wan1.well_authorization_number,
                wan2.well_authorization_number,
            ]
        )
