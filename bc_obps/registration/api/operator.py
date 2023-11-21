from .api_base import router
from typing import List
from django.shortcuts import get_object_or_404
from registration.models import Operator
from registration.schema import OperatorOut


##### GET #####


@router.get("/operators", response=List[OperatorOut])
def list_operators(request):
    qs = Operator.objects.all()
    return qs


@router.get("/operators/{operator_id}", response=OperatorOut)
def get_operator(request, operator_id: int):
    operator = get_object_or_404(Operator, id=operator_id)
    return operator


##### POST #####


##### PUT #####


##### DELETE #####
