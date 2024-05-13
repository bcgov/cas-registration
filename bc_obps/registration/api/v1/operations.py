from registration.api.utils.current_user_utils import get_current_user_guid
from service.operation_service import OperationService
from registration.decorators import authorize, handle_http_errors
from ..router import router


from registration.models import (
    AppRole,
    UserOperator,
)
from registration.schema import (
    OperationCreateIn,
    OperationPaginatedOut,
    OperationCreateOut,
    Message,
    OperationFilterSchema,
)

from ninja.responses import codes_4xx
from ninja import Query


##### GET #####


@router.get("/operations", response={200: OperationPaginatedOut, codes_4xx: Message}, url_name="list_operations")
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def list_operations(request, filters: OperationFilterSchema = Query(...)):
    return 200, OperationService.list_operations(get_current_user_guid(request), filters)


##### POST #####


@router.post("/operations", response={201: OperationCreateOut, codes_4xx: Message}, url_name="create_operation")
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def create_operation(request, payload: OperationCreateIn):
    return 201, OperationService.create_operation(get_current_user_guid(request), payload)
