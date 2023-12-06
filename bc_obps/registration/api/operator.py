from typing import Optional
from .api_base import router
from django.shortcuts import get_object_or_404
from registration.models import Operator
from ninja.responses import codes_4xx, codes_5xx
from registration.schema import Message, OperatorOut


##### GET #####


@router.get("/operators", response={200: OperatorOut, codes_4xx: Message, codes_5xx: Message})
def get_operator_by_legal_name_or_cra(
    request, legal_name: Optional[str] = None, cra_business_number: Optional[int] = None
):
    try:
        if legal_name:
            operator = Operator.objects.get(legal_name=legal_name)
        elif cra_business_number:
            operator = Operator.objects.get(cra_business_number=cra_business_number)
        else:
            return 404, {"message": "No parameters provided"}
    except Operator.DoesNotExist:
        return 404, {"message": "No matching operator found"}
    except Exception as e:
        return 500, {"message": "An error occurred!"}
    return 200, operator


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
