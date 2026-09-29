from typing import Optional

from django.db.models import QuerySet
from ninja import Query

from registry.models import Unit
from registry.schema.unit import UnitFilterSchema
from service.data_access_service.unit_service import UnitDataAccessService


class UnitService:
    @classmethod
    def list_units(
        cls,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: UnitFilterSchema = Query(...),
    ) -> QuerySet[Unit]:
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field or 'vintage'}"
        base_qs = UnitDataAccessService.get_all_units()

        return filters.filter(base_qs).order_by(sort_by)
