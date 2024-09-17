from typing import Optional
from django.db.models import QuerySet
from reporting.models import FuelType
from reporting.schema.fuel import FuelTypeSchema
from django.core.cache import cache

##### GET #####


class FuelTypeDataAccessService:
    @classmethod
    def get_fuels(cls) -> QuerySet[FuelType]:
        cached_data: Optional[QuerySet[FuelType]] = cache.get("fuels")
        if cached_data:
            return cached_data
        else:
            fuels = FuelType.objects.only(*FuelTypeSchema.Meta.fields).order_by('id')
            cache.set("fuels", fuels, 60 * 60 * 24 * 1)  # 1 day
            return fuels

    @classmethod
    def get_fuel(cls, fuel_name: str) -> FuelType:
        cached_data: Optional[FuelType] = cache.get("fuel")
        if cached_data:
            return cached_data
        else:
            fuel = FuelType.objects.get(name=fuel_name)
            cache.set("fuel", fuel, 60 * 60 * 24 * 1)  # 1 day
            return fuel
