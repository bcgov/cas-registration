from .api_base import router
from typing import List
from django.shortcuts import get_object_or_404
from registration.models import Operator
from registration.schema import OperatorOut
from registration.utils import check_users_admin_request_eligibility, check_access_request_matches_business_guid
from ninja.responses import codes_4xx
from registration.schema import Message, OperatorOut, RequestAccessOut, SelectOperatorIn
import json


##### GET #####


@router.get("/operators", response=List[OperatorOut])
def list_operators(request):
    print('here')
    qs = Operator.objects.all()
    print(qs)
    return qs


@router.get("/operators/{operator_id}", response=OperatorOut)
def get_operator(request, operator_id: int):
    operator = get_object_or_404(Operator, id=operator_id)
    return operator


@router.get("/select-operator/{int:operator_id}", response={200: SelectOperatorIn, codes_4xx: Message})
def select_operator(request, operator_id: int):
    print('HERE', operator_id)
    operator: Operator = get_object_or_404(Operator, id=operator_id)

    return 200, {"operator_id": operator.id}


##### POST #####


##### PUT #####


##### DELETE #####
