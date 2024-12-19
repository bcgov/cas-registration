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
    def check_current_users_registered_operation(cls, operator_id: UUID) -> bool:
        """
        Returns True if the userOperator's operator has at least one operation with status 'Registered', False otherwise.
        """
        return Operation.objects.filter(operator_id=operator_id, status="Registered").exists()
