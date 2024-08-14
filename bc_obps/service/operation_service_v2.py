from typing import Dict, Union
from uuid import UUID
from service.operation_service import OperationService
from registration.models.registration_purpose import RegistrationPurpose
from service.data_access_service.registration_purpose_service import registrationpurposeDataAccessService
from registration.schema.v2.operation import OperationFilterSchema, RegistrationPurposeIn
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operation_service import OperationDataAccessService
from django.db.models import Q
from django.db import transaction
from django.core.paginator import Paginator
from ninja import Query
from registration.models import Operation
from registration.constants import PAGE_SIZE
from django.db.models import QuerySet


class OperationServiceV2:
    @classmethod
    def list_operations(
        cls, user_guid: UUID, filters: OperationFilterSchema = Query(...)
    ) -> Dict[str, Union[list[Operation], int]]:
        user = UserDataAccessService.get_by_guid(user_guid)
        page = filters.page
        bcghg_id = filters.bcghg_id
        name = filters.name
        type = filters.type
        operator = filters.operator
        sort_field = filters.sort_field
        sort_order = filters.sort_order
        sort_direction = "-" if sort_order == "desc" else ""
        base_qs = OperationDataAccessService.get_all_operations_for_user(user)
        list_of_filters = [
            Q(bcghg_id__icontains=bcghg_id) if bcghg_id else Q(),
            Q(name__icontains=name) if name else Q(),
            Q(type__icontains=type) if type else Q(),
            Q(operator__legal_name__icontains=operator) if operator else Q(),
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

    @classmethod
    def list_current_users_operations(
        cls,
        user_guid: UUID,
    ) -> QuerySet[Operation]:
        user = UserDataAccessService.get_by_guid(user_guid)
        return OperationDataAccessService.get_all_operations_for_user(user)

    @classmethod
    @transaction.atomic()
    def register_operation_information(
        cls, user_guid: UUID, operation_id: UUID, payload: RegistrationPurposeIn
    ) -> Operation:
        operation: Operation = OperationService.get_if_authorized(user_guid, operation_id)

        # add the payload's purpose as long as it's not reporting or regulated (will add these later)
        if (
            payload.registration_purpose != RegistrationPurpose.Purposes.OBPS_REGULATED_OPERATION
            and payload.registration_purpose != RegistrationPurpose.Purposes.REPORTING_OPERATION
        ):
            registrationpurposeDataAccessService.create_registration_purpose(
                user_guid, operation_id, payload.dict(include={'registration_purpose'})
            )

        if (
            payload.registration_purpose != RegistrationPurpose.Purposes.ELECTRICITY_IMPORT_OPERATION
            and payload.registration_purpose != RegistrationPurpose.Purposes.POTENTIAL_REPORTING_OPERATION
        ):
            for purpose in [
                RegistrationPurpose.Purposes.OBPS_REGULATED_OPERATION,
                RegistrationPurpose.Purposes.REPORTING_OPERATION,
            ]:
                registrationpurposeDataAccessService.create_registration_purpose(
                    user_guid, operation_id, {'registration_purpose': purpose}
                )
            if payload.regulated_products:
                operation.regulated_products.set(payload.regulated_products)

        operation.set_create_or_update(user_guid)
        return operation

    @classmethod
    @transaction.atomic()
    def update_status(cls, user_guid: UUID, operation_id: UUID, status: Operation.Statuses) -> Operation:
        operation = OperationService.get_if_authorized(user_guid, operation_id)
        operation.status = Operation.Statuses(status)
        operation.save(update_fields=['status'])
        operation.set_create_or_update(user_guid)
        return operation
