from uuid import UUID
from typing import TypeVar

from django.db.models import IntegerField, Model, Q, QuerySet, Sum
from django.db.models.functions import Coalesce

from registry.models import Unit

ModelType = TypeVar("ModelType", bound=Model)


class UnitDataAccessService:
    @classmethod
    def with_unit_quantities(
        cls, queryset: QuerySet[ModelType], unit_relation: str
    ) -> QuerySet[ModelType]:
        unit_status_path = f"{unit_relation}__status"
        unit_quantity_path = f"{unit_relation}__quantity"

        return queryset.annotate(
            issued_quantity=Coalesce(
                Sum(
                    unit_quantity_path,
                    filter=Q(**{unit_status_path: Unit.Status.ISSUED}),
                ),
                0,
                output_field=IntegerField(),
            ),
            active_quantity=Coalesce(
                Sum(
                    unit_quantity_path,
                    filter=Q(**{unit_status_path: Unit.Status.ACTIVE}),
                ),
                0,
                output_field=IntegerField(),
            ),
            retired_quantity=Coalesce(
                Sum(
                    unit_quantity_path,
                    filter=Q(**{unit_status_path: Unit.Status.RETIRED}),
                ),
                0,
                output_field=IntegerField(),
            ),
        )

    @classmethod
    def get_all_units(cls) -> QuerySet[Unit]:
        return (
            Unit.objects.select_related(
                "program",
                "project",
                "issuance",
                "issuance__account",
            )
            .all()
        )

    @classmethod
    def get_by_id(cls, unit_id: UUID) -> Unit:
        return Unit.objects.get(id=unit_id)
