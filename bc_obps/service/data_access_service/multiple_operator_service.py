from registration.models.operation import Operation
from registration.models.multiple_operator import MultipleOperator
from uuid import UUID
from ninja.types import DictStrAny


class MultipleOperatorService:
    @classmethod
    def create_or_update(
        cls, multiple_operator_id: int | None, operation: Operation, user_guid: UUID, data: DictStrAny
    ) -> MultipleOperator:
        mo_operator_instance, _ = MultipleOperator.objects.update_or_create(
            pk=multiple_operator_id,
            defaults={**data, 'operation': operation},
        )

        return mo_operator_instance
