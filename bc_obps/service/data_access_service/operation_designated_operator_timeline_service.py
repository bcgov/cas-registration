from typing import List
from registration.schema.v2.operation_timeline import OperationTimelineListOut

from registration.enums.enums import OperationTypes
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline
from service.user_operator_service import UserOperatorService
from registration.models import User
from django.db.models import QuerySet
from django.db.models import Subquery, OuterRef, UUIDField, CharField


class OperationDesignatedOperatorTimelineDataAccessService:
    @classmethod
    def get_operations_for_industry_user(cls, user: User) -> QuerySet[OperationDesignatedOperatorTimeline]:
        """
        Retrieve all operations accessible by the given industry user, with optional annotations
        for SFO facility ID and name.

        The queryset is annotated with the `sfo_facility_id` and `facility_name` if the
        operation type is SFO and the operation is actively designated for a facility.

        Args:
            user (User): The user for whom operations are being fetched.
        """

        user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)

        facilities_subquery = FacilityDesignatedOperationTimeline.objects.filter(
            operation_id=OuterRef('operation'), operation_id__type=OperationTypes.SFO.value, end_date__isnull=True
        ).order_by('start_date')

        # Subquery for sfo_facility_id (UUID) and facility_name (string)
        sfo_facility_id_subquery = facilities_subquery.values('facility__pk')[:1]
        sfo_facility_name_subquery = facilities_subquery.values('facility__name')[:1]

        only_fields: List[str] = [
            *OperationTimelineListOut.Meta.fields,
            "operation__name",
            "operation__type",
            "operation__bc_obps_regulated_operation__id",
            "operation__id",
        ]
        queryset = (
            OperationDesignatedOperatorTimeline.objects.filter(operator_id=user_operator.operator_id)
            .annotate(
                sfo_facility_id=Subquery(sfo_facility_id_subquery, output_field=UUIDField()),
                sfo_facility_name=Subquery(sfo_facility_name_subquery, output_field=CharField()),
            )
            .only(*only_fields)
        )
        return queryset
