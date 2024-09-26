import pytest
from reporting.models import FuelType
from service.data_access_service.fuel_service import FuelTypeDataAccessService

pytestmark = pytest.mark.django_db


class TestDataAccessFacilityService:
    @staticmethod
    def test_get_fuels():
        assert FuelTypeDataAccessService.get_fuels().count() == FuelType.objects.all().count()

    @staticmethod
    def test_get_fuel():
        returned_fuel = FuelTypeDataAccessService.get_fuel('Acetylene')
        assert returned_fuel.name == 'Acetylene'
        assert returned_fuel.unit == 'Sm^3'
        assert returned_fuel.classification == 'Exempted Non-biomass'
