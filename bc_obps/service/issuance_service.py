from typing import Optional

from django.db.models import QuerySet
from ninja import Query

from registry.models import Unit
from registry.schema.issuance import IssuanceFilterSchema
from service.data_access_service.issuance_service import IssuanceDataAccessService


class IssuanceService:
    SORT_FIELDS = {
        "name": "issuance__account__name",
        "account_name": "issuance__account__name",
        "project_name": "project__name",
        "project_type": "project__project_type",
        "vintage_year": "vintage",
        "issuance_year": "issuance_year",
        "serial_number": "serial_number",
        "verifier_name": "issuance__verifier__name",
        "unit_quantity": "quantity",
        "unit_class": "unit_type",
        "project_id": "project_id",
        "request_date": "issuance__request_date",
        "issuance_date": "issuance__issuance_date",
    }

    @classmethod
    def list_issuances(
        cls,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: IssuanceFilterSchema = Query(...),
    ) -> QuerySet[Unit]:
        sort_direction = "-" if sort_order == "desc" else ""
        field = cls.SORT_FIELDS.get(sort_field or "request_date", "issuance__request_date")
        sort_by = f"{sort_direction}{field}"
        base_qs = IssuanceDataAccessService.get_all_issuances()
        return filters.filter(base_qs).order_by(sort_by)