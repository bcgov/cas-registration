from uuid import UUID
from ninja.types import DictStrAny
from typing import List
from registration.models.operation import Operation
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline
from registration.models import User
from django.db.models import QuerySet, Subquery, OuterRef, UUIDField, CharField
from service.user_operator_service import UserOperatorService
from django.contrib.postgres.aggregates import ArrayAgg


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
    def get_operation_timeline_for_user(
        cls, user: User, exclude_previously_owned: bool = True
    ) -> QuerySet[OperationDesignatedOperatorTimeline]:
        """
        Retrieve all operation timeline records accessible by the given user, optionally including previously owned operations, with optional annotations for SFO facility ID and name.

        Depending on the user's role, this function returns a queryset of `Operation` objects:
        - IRC users can access all registered operations.
        - Industry users can only access operations associated with their own operator.

        The queryset is annotated with the `sfo_facility_id` and `facility_name` if the
        operation type is SFO and the operation is actively designated for a facility.

        Args:
            user (User): The user for whom operations are being fetched.
            exclude_previously_owned (bool): Whether or not to include operations that the user previously owned (ie, that were transferred). Defaults to exclusion.
        """

        facilities_subquery = (
            FacilityDesignatedOperationTimeline.objects.filter(
                operation_id=OuterRef('operation'),
                operation_id__type=Operation.Types.SFO,
            )
            .only('facility__pk', 'facility__name')
            .order_by('start_date')
        )
        if exclude_previously_owned:
            facilities_subquery.filter(
                end_date__isnull=True,
            )

        # Subquery for sfo_facility_id (UUID) and facility_name (string)
        sfo_facility_id_subquery = facilities_subquery.values('facility__pk')[:1]
        sfo_facility_name_subquery = facilities_subquery.values('facility__name')[:1]

        only_fields: List[str] = [
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
                'operator',
                'operation',
                'operation__bcghg_id',
                'operation__bc_obps_regulated_operation',
            )
            .annotate(
                sfo_facility_id=Subquery(sfo_facility_id_subquery, output_field=UUIDField()),
                sfo_facility_name=Subquery(sfo_facility_name_subquery, output_field=CharField()),
                operation__contact_ids=ArrayAgg('operation__contacts__id', distinct=True),
            )
            .only(*only_fields)
        )
        if exclude_previously_owned:
            queryset = queryset.filter(end_date__isnull=True)

        if user.is_irc_user():
            # IRC users see all operations (subject to filtering that's done on the endpoint)
            return queryset
        else:
            # Industry users can only see operations associated with their own operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            return queryset.filter(operator_id=user_operator.operator_id)

    @classmethod
    def get_previously_owned_operations_by_operator(
        cls, operator_id: UUID
    ) -> QuerySet[OperationDesignatedOperatorTimeline]:
        """
        Gets a list of operations & the dates that they were previously owned by an operator.
        """

        return OperationDesignatedOperatorTimeline.objects.filter(operator_id=operator_id, end_date__isnull=False)
