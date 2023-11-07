from .api_base import router
from typing import List
from django.shortcuts import get_object_or_404
from registration.models import Operation, Operator, NaicsCode, NaicsCategory, User, UserOperator
from registration.utils import check_users_admin_request_eligibility, update_model_instance
from ninja.responses import codes_4xx
from registration.schema import Message, OperatorOut, RequestAccessOut, SelectOperatorIn


##### GET #####


@router.get("/operators", response=List[OperatorOut])
def list_operators(request):
    qs = Operator.objects.all()
    return qs


@router.get("/operators/{operator_id}", response=OperatorOut)
def get_operator(request, operator_id: int):
    operator = get_object_or_404(Operator, id=operator_id)
    return operator


@router.get("/select-operator/{int:operator_id}", response={200: SelectOperatorIn, codes_4xx: Message})
def select_operator(request, operator_id: int):
    user: User = User.objects.first()  # FIXME: placeholders until after authentication is set up
    operator: Operator = get_object_or_404(Operator, id=operator_id)

    # check if user is eligible to request access
    status, message = check_users_admin_request_eligibility(user, operator)
    if status != 200:
        return status, message

    return 200, {"operator_id": operator.id}


##### POST #####


@router.post("/select-operator/request-access", response={201: RequestAccessOut, codes_4xx: Message})
def request_access(request, payload: SelectOperatorIn):
    user: User = User.objects.first()  # FIXME: placeholders until after authentication is set up
    payload_dict: dict = payload.dict()
    operator: Operator = get_object_or_404(Operator, id=payload_dict.get("operator_id"))

    # check if user is eligible to request access
    status, message = check_users_admin_request_eligibility(user, operator)
    if status != 200:
        return status, message

    # Making a draft UserOperator instance if one doesn't exist
    user_operator, _ = UserOperator.objects.get_or_create(
        user=user, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.DRAFT
    )
    return 201, {"user_operator_id": user_operator.id}


##### PUT #####


##### DELETE #####
