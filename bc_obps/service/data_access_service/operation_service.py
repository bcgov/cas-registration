from typing import List, Optional
from uuid import UUID
from registration.models import Operation, User, RegulatedProduct, Activity
from ninja.types import DictStrAny
from django.db.models import QuerySet
from service.user_operator_service import UserOperatorService


class OperationDataAccessService:
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
        return Operation.objects.filter(operator_id=operator_id, status=Operation.Statuses.REGISTERED).exists()

    @classmethod
    def check_current_users_reporting_registered_operation(cls, operator_id: UUID) -> bool:
        """
        Returns True if the userOperator's operator has at least one operation with status 'Registered'
        and registration_purpose not equal to POTENTIAL_REPORTING_OPERATION, False otherwise.
        """
        return (
            Operation.objects.filter(operator_id=operator_id, status=Operation.Statuses.REGISTERED)
            .exclude(registration_purpose=Operation.Purposes.POTENTIAL_REPORTING_OPERATION)
            .exists()
        )

    @classmethod
    def create_operation(
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

    @classmethod
    def get_all_operations_for_user(cls, user: User, include_all_statuses: bool = False) -> QuerySet[Operation]:
        """
        Returns a queryset of operations visible to the given user.

        - For IRC users:
            - If `include_all_statuses` is False (default), operations with a status of
              "Not Started" or "Draft" are excluded.
            - If `include_all_statuses` is True, all operations are returned regardless of status.
        - For industry users:
            - Only operations associated with the user's approved operator are returned.

        Args:
            user (User): The user requesting the operations.
            include_all_statuses (bool, optional): Whether to include operations in all statuses
                for IRC users. Defaults to False.

        Returns:
            QuerySet[Operation]: A queryset of operations visible to the user.
        """
        if user.is_irc_user():
            # IRC users can optionally see all operations regardless of status (e.g., if they are on the Transfers page),
            # or filter to only see operations with a status of "Registered" (e.g., if they are in the Operations grid)
            queryset = Operation.objects.select_related("operator", "bc_obps_regulated_operation")

            if not include_all_statuses:
                queryset = queryset.exclude(status__in=[Operation.Statuses.NOT_STARTED, Operation.Statuses.DRAFT])

            return queryset.only(
                "id", "name", "submission_date", "status", "operator__legal_name", "bc_obps_regulated_operation__id"
            )
        else:
            # Industry users can only see operations associated with their own operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
        return (
            Operation.objects.select_related("operator", "bc_obps_regulated_operation")
            .filter(operator_id=user_operator.operator_id)
            .only("id", "name", "submission_date", "status", "operator__legal_name", "bc_obps_regulated_operation__id")
        )
