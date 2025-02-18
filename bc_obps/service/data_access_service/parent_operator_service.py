from registration.models.parent_operator import ParentOperator
from registration.models.operator import Operator
from ninja.types import DictStrAny


class ParentOperatorService:
    @classmethod
    def create_or_update(cls, parent_operator_id: int | None, operator: Operator, data: DictStrAny) -> ParentOperator:
        po_operator_instance, _ = ParentOperator.objects.update_or_create(
            pk=parent_operator_id,
            defaults={**data, 'child_operator': operator},
        )

        return po_operator_instance
