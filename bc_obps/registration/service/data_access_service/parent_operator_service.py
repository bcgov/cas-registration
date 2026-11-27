from ninja.types import DictStrAny
from registration.models.operator import Operator
from registration.models.parent_operator import ParentOperator


class ParentOperatorService:
    @classmethod
    def create_or_update(
        cls, parent_operator_id: int | None, operator: Operator, data: DictStrAny
    ) -> ParentOperator:
        po_operator_instance, _ = ParentOperator.objects.update_or_create(
            # A None pk is the intentional "create" path; django-stubs 6.0 rejects None in lookups.
            pk=parent_operator_id,  # type: ignore[misc]
            defaults={**data, "child_operator": operator},
        )

        return po_operator_instance
