from typing import List, Optional
from uuid import UUID

from registration.models import Operation
from ninja.types import DictStrAny

from registration.models import RegulatedProduct, Activity


class OperationDataAccessServiceV2:
    @classmethod
    def get_by_id(cls, operation_id: UUID, only_fields: Optional[List[str]] = None) -> Operation:

        if only_fields:
            operation: Operation = Operation.objects.only(*only_fields).get(id=operation_id)
        else:
            operation = (
                Operation.objects.select_related(
                    'created_by',
                    'updated_by',
                    'archived_by',
                    'operator',
                    'naics_code',
                    'secondary_naics_code',
                    'tertiary_naics_code',
                    'bcghg_id',
                    'verified_by',
                    'point_of_contact',
                    'bc_obps_regulated_operation',
                    'opted_in_operation',
                )
                .prefetch_related("activities", "regulated_products", "contacts", "multiple_operators", "documents")
                .get(id=operation_id)
            )

        return operation

    @classmethod
    def check_current_users_registered_operation(cls, operator_id: UUID) -> bool:
        """
        Returns True if the userOperator's operator has at least one operation with status 'Registered', False otherwise.
        """
        return Operation.objects.filter(operator_id=operator_id, status="Registered").exists()

    @classmethod
    def create_operation_v2(
        cls,
        user_guid: UUID,
        operation_data: DictStrAny,
        activities: list[int] | list[Activity],
        regulated_products: list[int] | list[RegulatedProduct],
    ) -> Operation:
        operation = Operation.objects.create(
            **operation_data,
            created_by_id=user_guid,
        )

        operation.activities.set(activities)
        operation.regulated_products.set(regulated_products)

        return operation
