from registration.constants import PAGE_SIZE
from django.db import transaction
from django.db.models import Q
from registration.decorators import authorize
from .api_base import router

from django.core.exceptions import ValidationError


from django.core.paginator import Paginator
from registration.models import (
    AppRole,
    Operation,
    User,
    UserOperator,
)
from registration.schema import (
    OperationCreateIn,
    OperationPaginatedOut,
    OperationCreateOut,
    Message,
    OperationListOut,
    OperationFilterSchema,
)
from registration.utils import (
    generate_useful_error,
    get_current_user_approved_user_operator_or_raise,
)
from ninja.responses import codes_4xx
from ninja import Query


##### GET #####


@router.get("/operations", response={200: OperationPaginatedOut, codes_4xx: Message}, url_name="list_operations")
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def list_operations(request, filters: OperationFilterSchema = Query(...)):
    user: User = request.current_user
    page = filters.page
    bcghg_id = filters.bcghg_id
    bc_obps_regulated_operation = filters.bc_obps_regulated_operation
    name = filters.name
    operator = filters.operator
    sort_field = filters.sort_field
    sort_order = filters.sort_order
    status = filters.status
    sort_direction = "-" if sort_order == "desc" else ""

    qs = None

    # IRC users can see all operations except ones with status of "Not Started" or "Draft"
    if user.is_irc_user():
        qs = (
            Operation.objects.select_related("operator", "bc_obps_regulated_operation")
            .exclude(status=Operation.Statuses.NOT_STARTED)
            .exclude(status=Operation.Statuses.DRAFT)
            .filter(
                Q(bcghg_id__icontains=bcghg_id) if bcghg_id else Q(),
                Q(bc_obps_regulated_operation__id__icontains=bc_obps_regulated_operation)
                if bc_obps_regulated_operation
                else Q(),
                Q(name__icontains=name) if name else Q(),
                Q(operator__legal_name__icontains=operator) if operator else Q(),
                Q(status__icontains=status) if status else Q(),
            )
            .only(*OperationListOut.Config.model_fields, "operator__legal_name", "bc_obps_regulated_operation__id")
            .order_by(f"{sort_direction}{sort_field}")
        )

    else:
        # Industry users can only see their companies' operations (industry user must be approved)
        user_operator = get_current_user_approved_user_operator_or_raise(user)
        # order by created_at to get the latest one first
        qs = (
            Operation.objects.select_related("operator", "bc_obps_regulated_operation")
            .filter(
                Q(bcghg_id__icontains=bcghg_id) if bcghg_id else Q(),
                Q(bc_obps_regulated_operation__id__icontains=bc_obps_regulated_operation)
                if bc_obps_regulated_operation
                else Q(),
                Q(name__icontains=name) if name else Q(),
                Q(operator__legal_name__icontains=operator) if operator else Q(),
                Q(status__icontains=status) if status else Q(),
                operator_id=user_operator.operator_id,
            )
            .order_by(f"{sort_direction}{sort_field}")
            .only(*OperationListOut.Config.model_fields, "operator__legal_name", "bc_obps_regulated_operation__id")
        )

    paginator = Paginator(qs, PAGE_SIZE)

    try:
        page = paginator.validate_number(page)
    except Exception:
        page = 1

    return 200, {
        "data": [(operation) for operation in paginator.page(page).object_list],
        "row_count": paginator.count,
    }


##### POST #####


@router.post("/operations", response={201: OperationCreateOut, codes_4xx: Message}, url_name="create_operation")
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def create_operation(request, payload: OperationCreateIn):
    user: User = request.current_user
    user_operator = get_current_user_approved_user_operator_or_raise(user)

    payload_dict: dict = payload.dict(
        exclude={
            "regulated_products",
            "naics_code",
        }
    )

    # check that the operation doesn't already exist
    bcghg_id: str = payload.bcghg_id
    if bcghg_id:
        existing_operation: Operation = Operation.objects.only('bcghg_id').filter(bcghg_id=bcghg_id).exists()
        if existing_operation:
            return 400, {"message": "Operation with this BCGHG ID already exists."}
    try:
        with transaction.atomic():
            operation = Operation.objects.create(
                **payload_dict,
                operator_id=user_operator.operator_id,
                naics_code_id=payload.naics_code,
                created_by_id=user.pk,
            )
            operation.regulated_products.set(payload.regulated_products)
            # Not needed for MVP
            # operation.reporting_activities.set(payload.reporting_activities)
            # if payload.operation_has_multiple_operators:
            #     create_or_update_multiple_operators(payload.multiple_operators_array, operation, user)

            return 201, {"name": operation.name, "id": operation.id}
    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}
