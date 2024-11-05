from typing import List
from uuid import UUID

from registration.enums.enums import OperationTypes
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.schema.v2.operation import OperationListOut
from service.user_operator_service import UserOperatorService
from registration.models import Operation, User
from django.db.models import QuerySet
from django.db.models import Subquery, OuterRef, UUIDField


class OperationDataAccessServiceV2:
    @classmethod
    def get_all_operations_for_user(cls, user: User) -> QuerySet[Operation]:
        """
        Retrieve all operations accessible by the given user, with optional annotation for SFO facility ID.

        Depending on the user's role, this function returns a queryset of `Operation` objects:
        - IRC users can access all operations.
        - Industry users can only access operations associated with their own operator.

        The queryset is annotated with the `sfo_facility_id` if the operation type is SFO and the operation is actively designated for a facility.

        Args:
            user (User): The user for whom operations are being fetched.
        """
        facilities_subquery = (
            # Subquery to get the first active facility's pk for each SFO operation.
            # This is more optimized than using a resolver in the schema.
            FacilityDesignatedOperationTimeline.objects.filter(
                operation_id=OuterRef('pk'), operation__type=OperationTypes.SFO.value, end_date__isnull=True
            )
            .order_by('start_date')
            .values('facility__pk')[:1]
        )
        only_fields: List[str] = [
            *OperationListOut.Meta.fields,
            "operator__legal_name",
            "bc_obps_regulated_operation__id",
        ]
        if user.is_irc_user():
            return (
                Operation.objects.select_related("operator", "bc_obps_regulated_operation")
                .annotate(sfo_facility_id=Subquery(facilities_subquery, output_field=UUIDField()))
                .only(*only_fields)
            )
        else:
            # Industry users can only see operations associated with their own operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            return (
                Operation.objects.select_related("operator", "bc_obps_regulated_operation")
                .filter(operator_id=user_operator.operator_id)
                .annotate(sfo_facility_id=Subquery(facilities_subquery, output_field=UUIDField()))
                .only(*only_fields)
            )

    @classmethod
    def check_current_users_registered_operation(cls, operator_id: UUID) -> bool:
        """
        Returns True if the userOperator's operator has at least one operation with status 'Registered', False otherwise.
        """
        return Operation.objects.filter(operator_id=operator_id, status="Registered").exists()
