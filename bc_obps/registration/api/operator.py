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


@router.get("/operators", response={200: List[OperatorOut], codes_4xx: Message})
def list_operators(request):
    try:
        operators = Operator.objects.all()
    except Exception as e:
        return 404, {"message": "No matching operator found"}
    return 200, operators


@router.get("/operators/{operator_id}", response={200: OperatorOut, codes_4xx: Message})
def get_operator(request, operator_id: int):
    try:
        operator = get_object_or_404(Operator, id=operator_id)
    except Exception as e:
        return 404, {"message": "No matching operator found"}
    return 200, operator


##### POST #####


##### PUT #####


##### DELETE #####
