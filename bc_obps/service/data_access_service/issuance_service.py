from django.db.models import QuerySet
from django.db.models.functions import ExtractYear

from registry.models import Unit
from service.data_access_service.unit_service import UnitDataAccessService


class IssuanceDataAccessService:
    @classmethod
    def get_all_issuances(cls) -> QuerySet[Unit]:
        return UnitDataAccessService.get_all_units().annotate(
            issuance_year=ExtractYear("issuance__issuance_date")
        )