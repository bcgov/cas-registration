from typing import Literal, Tuple
from django.http import HttpRequest
from registration.schema.v2.operation import OperationFilterSchema, OperationPaginatedOut
from service.operation_service_v2 import OperationService
from registration.decorators import handle_http_errors
from ..router import router


from registration.schema.generic import Message
from ninja.responses import codes_4xx
from ninja import Query
from ninja.types import DictStrAny

##### GET #####


@router.get("/v2/operations", response={200: OperationPaginatedOut, codes_4xx: Message}, tags=["V2"])
# brianna
# @authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def list_operations_v2(
    request: HttpRequest, filters: OperationFilterSchema = Query(...)
) -> Tuple[Literal[200], DictStrAny]:
    # brianna
    return 200, OperationService.list_operations('ba2ba62a-1218-42e0-942a-ab9e92ce8822', filters)
    # return 200, OperationService.list_operations(get_current_user_guid(request), filters)


#
