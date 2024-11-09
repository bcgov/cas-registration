from typing import List
from uuid import UUID

from registration.enums.enums import OperationTypes
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.schema.v2.operation import OperationListOut
from service.user_operator_service import UserOperatorService
from registration.models import Operation, User
from django.db.models import QuerySet
from django.db.models import Subquery, OuterRef, UUIDField, CharField


class OperationDataAccessServiceV2:
    @classmethod
    def get_all_operations_for_user(cls, user: User) -> QuerySet[Operation]:
        """
        Retrieve all operations accessible by the given user, with optional annotations
        for SFO facility ID and name.

        Depending on the user's role, this function returns a queryset of `Operation` objects:
        - IRC users can access all operations.
        - Industry users can only access operations associated with their own operator.

        The queryset is annotated with the `sfo_facility_id` and `facility_name` if the
        operation type is SFO and the operation is actively designated for a facility.

        Args:
            user (User): The user for whom operations are being fetched.
        """
        facilities_subquery = FacilityDesignatedOperationTimeline.objects.filter(
            operation_id=OuterRef('pk'), operation__type=OperationTypes.SFO.value, end_date__isnull=True
        ).order_by('start_date')

        # Subquery for sfo_facility_id (UUID) and facility_name (string)
        sfo_facility_id_subquery = facilities_subquery.values('facility__pk')[:1]
        sfo_facility_name_subquery = facilities_subquery.values('facility__name')[:1]

        only_fields: List[str] = [
            *OperationListOut.Meta.fields,
            "operator__legal_name",
            "bc_obps_regulated_operation__id",
        ]

        queryset = (
            Operation.objects.select_related("operator", "bc_obps_regulated_operation")
            .annotate(
                sfo_facility_id=Subquery(sfo_facility_id_subquery, output_field=UUIDField()),
                sfo_facility_name=Subquery(sfo_facility_name_subquery, output_field=CharField()),
            )
            .only(*only_fields)
        )

        if user.is_irc_user():
            return queryset
        else:
            # Industry users can only see operations associated with their own operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            return queryset.filter(operator_id=user_operator.operator_id)

    @classmethod
    def check_current_users_registered_operation(cls, operator_id: UUID) -> bool:
        """
        Returns True if the userOperator's operator has at least one operation with status 'Registered', False otherwise.
        """
        return Operation.objects.filter(operator_id=operator_id, status="Registered").exists()
