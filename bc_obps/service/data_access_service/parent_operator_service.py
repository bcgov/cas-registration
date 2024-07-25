from registration.models.parent_operator import ParentOperator
from uuid import UUID
from registration.models.operator import Operator
from ninja.types import DictStrAny


class ParentOperatorService:
    @classmethod
    def create_or_update(
        cls, parent_operator_id: int | None, operator: Operator, user_guid: UUID, data: DictStrAny
    ) -> ParentOperator:
        po_operator_instance, _ = ParentOperator.objects.update_or_create(
            pk=parent_operator_id,
            defaults={**data, 'child_operator': operator},
        )
        po_operator_instance.set_create_or_update(user_guid)
        return po_operator_instance
