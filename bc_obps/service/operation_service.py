from typing import Dict, Union
from uuid import UUID
from registration.emails import send_boro_id_application_email
from registration.enums.enums import BoroIdApplicationStates
from service.data_access_service.user_service import UserDataAccessService
from registration.schema.v1.operation import OperationFilterSchema
from service.data_access_service.operation_service import OperationDataAccessService
from django.db.models import Q
from django.core.paginator import Paginator
from ninja import Query
from datetime import datetime
from registration.models import (
    Operation,
    Operator,
    User,
)
from zoneinfo import ZoneInfo
from registration.constants import PAGE_SIZE, UNAUTHORIZED_MESSAGE


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



    @classmethod
    def list_operations(
        cls, user_guid: UUID, filters: OperationFilterSchema = Query(...)
    ) -> Dict[str, Union[list[Operation], int]]:
        user = UserDataAccessService.get_by_guid(user_guid)
        page = filters.page
        bcghg_id = filters.bcghg_id
        bc_obps_regulated_operation = filters.bc_obps_regulated_operation
        name = filters.name
        operator = filters.operator
        sort_field = filters.sort_field
        sort_order = filters.sort_order
        status = filters.status
        sort_direction = "-" if sort_order == "desc" else ""

        base_qs = OperationDataAccessService.get_all_operations_for_user(user)
        list_of_filters = [
            Q(bcghg_id__id__icontains=bcghg_id) if bcghg_id else Q(),
            (
                Q(bc_obps_regulated_operation__id__icontains=bc_obps_regulated_operation)
                if bc_obps_regulated_operation
                else Q()
            ),
            Q(name__icontains=name) if name else Q(),
            Q(operator__legal_name__icontains=operator) if operator else Q(),
            Q(status__icontains=status) if status else Q(),
        ]

        qs = base_qs.filter(*list_of_filters).order_by(f"{sort_direction}{sort_field}")

        paginator = Paginator(qs, PAGE_SIZE)

        try:
            page = paginator.validate_number(page)
        except Exception:
            page = 1

        return {
            "data": [(operation) for operation in paginator.page(page).object_list],
            "row_count": paginator.count,
        }