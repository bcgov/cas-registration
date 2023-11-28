from .api_base import router
from typing import List
from django.shortcuts import get_object_or_404
from registration.models import Operator
from registration.schema import OperatorOut
from registration.utils import check_users_admin_request_eligibility
from ninja.responses import codes_4xx
from registration.schema import Message, OperatorOut, RequestAccessOut, SelectOperatorIn
import json


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
    user: User = request.current_user
    operator: Operator = get_object_or_404(Operator, id=operator_id)

    return 200, {"operator_id": operator.id}


##### POST #####


@router.post("/select-operator/request-admin-access", response={201: RequestAccessOut, codes_4xx: Message})
def request_access(request, payload: SelectOperatorIn):
    user: User = request.current_user
    payload_dict: dict = payload.dict()
    operator: Operator = get_object_or_404(Operator, id=payload_dict.get("operator_id"))

    # check if user is eligible to request access
    status, message = check_users_admin_request_eligibility(user, operator)
    if status != 200:
        return status, message

    # Making a draft UserOperator instance if one doesn't exist
    user_operator, _ = UserOperator.objects.get_or_create(
        user=user, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.PENDING
    )
    return 201, {"user_operator_id": user_operator.id}

@router.post("/select-operator/request-access", response={201: RequestAccessOut, codes_4xx: Message})
def request_access(request, payload: SelectOperatorIn):
    current_user_guid = json.loads(request.headers.get('Authorization'))["user_guid"]
    user: User = get_object_or_404(User, user_guid=current_user_guid)
    payload_dict: dict = payload.dict()
    operator: Operator = get_object_or_404(Operator, id=payload_dict.get("operator_id"))

    # Making a draft UserOperator instance if one doesn't exist
    user_operator, _ = UserOperator.objects.get_or_create(
        user=user, operator=operator, status=UserOperator.Statuses.PENDING
    )
    return 201, {"user_operator_id": user_operator.id}


##### PUT #####


##### DELETE #####
