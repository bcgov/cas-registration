from typing import List, Optional
from uuid import UUID
from registration.models import Operation, User, RegulatedProduct, Activity, Operator
from ninja.types import DictStrAny
from django.db.models import QuerySet, Q
from service.user_operator_service import UserOperatorService
from registration.constants import UNAUTHORIZED_MESSAGE


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
    def check_current_users_registered_regulated_operation(cls, operator_id: UUID) -> bool:
        """
        Returns True if the userOperator's operator has at least one operation with status 'Registered' and regulated registration purpose, False otherwise.
        """
        registered_operations = Operation.objects.filter(
            operator_id=operator_id, status=Operation.Statuses.REGISTERED
        ).only('registration_purpose')
        return any(op.is_regulated_operation for op in registered_operations)

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
    def get_all_current_operations_for_user(cls, user: User) -> QuerySet[Operation]:
        if user.is_irc_user():
            # IRC users can see all operations except ones with status of "Not Started" or "Draft"
            return (
                Operation.objects.select_related("operator", "bc_obps_regulated_operation")
                .exclude(status=Operation.Statuses.NOT_STARTED)
                .exclude(status=Operation.Statuses.DRAFT)
                .only(
                    "id", "name", "submission_date", "status", "operator__legal_name", "bc_obps_regulated_operation__id"
                )
            )
        else:
            # Industry users can only see operations associated with their own operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
        return (
            Operation.objects.select_related("operator", "bc_obps_regulated_operation")
            .filter(operator_id=user_operator.operator_id)
            .only("id", "name", "submission_date", "status", "operator__legal_name", "bc_obps_regulated_operation__id")
        )

    @classmethod
    def get_previously_owned_operations_for_operator(
        cls, user: User, operator_id: UUID, reporting_year: Optional[int] = None
    ) -> QuerySet[Operation]:
        """
        Returns all operations that were previously owned by the operator.
        If a param is specified for reporting_year, the results will additionally be filtered such that the ownership
        end data is greater than or equal to the reporting year.
        Otherwise, all past operations will be returned.
        Assumes that only industry users will be calling this function.
        """
        operator = Operator.objects.get(id=operator_id)
        # Check if the user has access to the specified operator
        if not operator.user_has_access(user.user_guid):
            # Raise an exception if access is denied
            raise Exception(UNAUTHORIZED_MESSAGE)
        filters = Q(designated_operators__operator_id=operator_id) & Q(designated_operators__end_date__isnull=False)
        if reporting_year is not None:
            filters &= Q(designated_operators__end_date__year__gte=reporting_year)
        return (
            Operation.objects.filter(
                filters,
            )
            .select_related("operator", "bc_obps_regulated_operation")
            .exclude(status__in=[Operation.Statuses.NOT_STARTED, Operation.Statuses.DRAFT])
            .only("id", "name", "submission_date", "status", "operator__legal_name", "bc_obps_regulated_operation__id")
        )
