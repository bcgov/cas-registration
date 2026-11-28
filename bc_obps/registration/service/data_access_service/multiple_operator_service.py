from uuid import UUID

from ninja.types import DictStrAny
from registration.models.multiple_operator import MultipleOperator
from registration.models.operation import Operation


class MultipleOperatorService:
    @classmethod
    def create_or_update(
        cls,
        multiple_operator_id: int | None,
        operation: Operation,
        user_guid: UUID,
        data: DictStrAny,
    ) -> MultipleOperator:
        mo_operator_instance, _ = MultipleOperator.objects.update_or_create(
            # A None pk is the intentional "create" path; django-stubs 6.0 rejects None in lookups.
            pk=multiple_operator_id,  # type: ignore[misc]
            defaults={**data, "operation": operation},
        )

        return mo_operator_instance
