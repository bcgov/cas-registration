from uuid import UUID
from registration.emails import send_boro_id_application_email
from registration.enums.enums import BoroIdApplicationStates
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operation_service import OperationDataAccessService
from datetime import datetime
from registration.models import (
    Operation,
    Operator,
    User,
)
from zoneinfo import ZoneInfo
from registration.constants import UNAUTHORIZED_MESSAGE


class OperationService:
    @classmethod
    def update_status(cls, user_guid: UUID, operation_id: UUID, status: Operation.Statuses) -> Operation:

        operation: Operation = OperationDataAccessService.get_by_id(operation_id)

        status = Operation.Statuses(status)
        if status in [Operation.Statuses.APPROVED, Operation.Statuses.DECLINED]:
            operation.verified_at = datetime.now(ZoneInfo("UTC"))
            operation.verified_by_id = user_guid
            if status == Operation.Statuses.APPROVED:
                operation.generate_unique_boro_id(user_guid=user_guid)
                # approve the operator if it's not already approved (the case for imported operators)
                operator: Operator = operation.operator
                if operator.status != Operator.Statuses.APPROVED:
                    operator.status = Operator.Statuses.APPROVED
                    operator.is_new = False
                    operator.verified_at = datetime.now(ZoneInfo("UTC"))
                    operator.verified_by_id = user_guid
                    operator.save(update_fields=["status", "is_new", "verified_at", "verified_by_id"])

        operation.status = status
        operation.save(update_fields=['status', 'verified_at', 'verified_by_id', 'bc_obps_regulated_operation'])

        # send email notification to external user (email template depends on operation.status)
        if status in [
            Operation.Statuses.APPROVED,
            Operation.Statuses.DECLINED,
            Operation.Statuses.CHANGES_REQUESTED,
        ]:
            send_boro_id_application_email(
                application_state=BoroIdApplicationStates(status),
                operator_legal_name=operation.operator.legal_name,
                operation_name=operation.name,
                opted_in=operation.opt_in,
                operation_creator=operation.created_by,
                point_of_contact=operation.point_of_contact,
            )
        return operation

    @classmethod
    def get_if_authorized(cls, user_guid: UUID, operation_id: UUID) -> Operation:
        operation: Operation = OperationDataAccessService.get_by_id_for_operation_out_schema(operation_id)
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if user.is_industry_user():
            if not operation.user_has_access(user.user_guid):
                raise Exception(UNAUTHORIZED_MESSAGE)
            return operation
        return operation