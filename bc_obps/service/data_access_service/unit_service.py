from uuid import UUID

from django.db.models import QuerySet

from registry.models import Unit


class UnitDataAccessService:
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
