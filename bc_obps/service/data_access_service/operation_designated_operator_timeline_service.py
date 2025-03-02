from uuid import UUID
from ninja.types import DictStrAny
from typing import List
from registration.models.operation import Operation
from registration.schema import OperationTimelineListOut
from registration.enums.enums import OperationTypes
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline
from service.user_operator_service import UserOperatorService
from registration.models import User
from django.db.models import QuerySet
from django.db.models import Subquery, OuterRef, UUIDField, CharField


class OperationDesignatedOperatorTimelineDataAccessService:
    @classmethod
    def create_operation_designated_operator_timeline(
        cls,
        user_guid: UUID,
        operation_designated_operator_timeline_data: DictStrAny,
    ) -> OperationDesignatedOperatorTimeline:
        operation_designated_operator_timeline = OperationDesignatedOperatorTimeline.objects.create(
            **operation_designated_operator_timeline_data,
            created_by_id=user_guid,
        )

        return operation_designated_operator_timeline

    @classmethod
    def get_operation_timeline_for_user(cls, user: User) -> QuerySet[OperationDesignatedOperatorTimeline]:
        """
        Retrieve all operation timeline records accessible by the given user, with optional annotations
        for SFO facility ID and name.

        Depending on the user's role, this function returns a queryset of `Operation` objects:
        - IRC users can access all registered operations.
        - Industry users can only access operations associated with their own operator (operations that have been transferred to another operator are excluded).

        The queryset is annotated with the `sfo_facility_id` and `facility_name` if the
        operation type is SFO and the operation is actively designated for a facility.

        Args:
            user (User): The user for whom operations are being fetched.
        """

        facilities_subquery = (
            FacilityDesignatedOperationTimeline.objects.filter(
                operation_id=OuterRef('operation'),
                operation_id__type=Operation.Types.SFO,
                end_date__isnull=True,
            )
            .only('facility__pk', 'facility__name')
            .order_by('start_date')
        )

        # Subquery for sfo_facility_id (UUID) and facility_name (string)
        sfo_facility_id_subquery = facilities_subquery.values('facility__pk')[:1]
        sfo_facility_name_subquery = facilities_subquery.values('facility__name')[:1]

        only_fields: List[str] = [
            *OperationTimelineListOut.Meta.fields,
            "operation__name",
            "operation__type",
            "operation__bc_obps_regulated_operation__id",
            "operation__bcghg_id__id",
            "operation__id",
            "operation__status",
            "operation__registration_purpose",
            "operator__legal_name",
        ]
        queryset = (
            OperationDesignatedOperatorTimeline.objects.select_related(
                'operator', 'operation', 'operation__bcghg_id', 'operation__bc_obps_regulated_operation'
            )
            .annotate(
                sfo_facility_id=Subquery(sfo_facility_id_subquery, output_field=UUIDField()),
                sfo_facility_name=Subquery(sfo_facility_name_subquery, output_field=CharField()),
            )
            .only(*only_fields)
        )

        if user.is_irc_user():
            # IRC users only see registered operations
            return queryset.filter(operation__status=Operation.Statuses.REGISTERED)
        else:
            # Industry users can only see operations associated with their own operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            return queryset.filter(operator_id=user_operator.operator_id).exclude(
                status=OperationDesignatedOperatorTimeline.Statuses.TRANSFERRED
            )
