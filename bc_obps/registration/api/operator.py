from typing import Optional
from registration.utils import check_users_admin_request_eligibility
from .api_base import router
from django.shortcuts import get_object_or_404
from registration.models import Operator, UserOperator
from ninja.responses import codes_4xx, codes_5xx
from registration.schema import Message, OperatorOut, SelectUserOperatorStatus
from registration.schema import OperatorOut
from registration.utils import (
    raise_401_if_role_not_authorized,
)
from ninja.errors import HttpError


##### GET #####


@router.get("/operators", response={200: OperatorOut, codes_4xx: Message, codes_5xx: Message})
def get_operator_by_legal_name_or_cra(
    request, legal_name: Optional[str] = None, cra_business_number: Optional[int] = None
):
    raise_401_if_role_not_authorized(
        request, ["industry_user", "industry_user_admin", "cas_admin", "cas_analyst", "cas_pending"]
    )
    try:
        if legal_name:
            operator = Operator.objects.get(legal_name=legal_name)
        elif cra_business_number:
            operator = Operator.objects.get(cra_business_number=cra_business_number)
        else:
            return 404, {"message": "No parameters provided"}
    except Operator.DoesNotExist:
        return 404, {"message": "No matching operator found. Retry or add operator."}
    except Exception as e:
        return 500, {"message": str(e)}

    # check if user is eligible to request access(mainly to prevent duplicate requests for the same operator and user)
    status, message = check_users_admin_request_eligibility(request.current_user, operator)
    if status != 200:
        return status, message

    return 200, operator


@router.get("/operators/{operator_id}", response={200: OperatorOut, codes_4xx: Message})
def get_operator(request, operator_id: int):
    raise_401_if_role_not_authorized(request, ["industry_user", "industry_user_admin", "cas_admin", "cas_analyst"])

    try:
        operator = get_object_or_404(Operator, id=operator_id)
    except Exception as e:
        return 404, {"message": "No matching operator found"}
    return 200, operator


@router.get("/operators/{operator_id}/user-operators", response=list[SelectUserOperatorStatus])
def list_user_operators_status_of_operator(request, operator_id: int):
    raise_401_if_role_not_authorized(request, ["industry_user", "industry_user_admin", "cas_admin", "cas_analyst"])
    qs = UserOperator.objects.filter(operator=operator_id)
    return qs


##### POST #####


##### PUT #####


##### DELETE #####
