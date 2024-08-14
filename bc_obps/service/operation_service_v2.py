from typing import Dict, Union
from uuid import UUID
from registration.schema.v2.operation import OperationFilterSchema
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operation_service import OperationDataAccessService
from django.db.models import Q
from django.core.paginator import Paginator
from ninja import Query
from registration.models import (
    Operation,
)
from registration.constants import PAGE_SIZE


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
