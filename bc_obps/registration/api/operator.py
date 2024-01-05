from typing import List, Optional
from registration.decorators import authorize
from registration.utils import check_users_admin_request_eligibility
from .api_base import router
from django.shortcuts import get_object_or_404
from registration.models import AppRole, Operator, UserOperator, User
from ninja.responses import codes_4xx, codes_5xx
from registration.schema import Message, OperatorOut, SelectUserOperatorStatus
from registration.schema.operator import OperatorIn, OperatorOut
from registration.utils import check_users_admin_request_eligibility
from registration.schema import (
    Message,
)
from datetime import datetime
import pytz


##### GET #####


@router.get("/operators", response={200: OperatorOut, codes_4xx: Message, codes_5xx: Message})
@authorize(AppRole.get_all_roles())
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
        return 404, {"message": "No matching operator found. Retry or add operator."}
    except Exception as e:
        return 500, {"message": str(e)}

    return 200, operator


@router.get("/operators/legal-name", response={200: List[OperatorOut], codes_4xx: Message, codes_5xx: Message})
def get_operator_by_legal_name_or_cra(request, search_value: Optional[str] = None):
    try:
        if search_value:
            operators = Operator.objects.filter(legal_name__icontains=search_value)
        else:
            return 404, {"message": "No parameters provided"}
    except Operator.DoesNotExist:
        return 404, {"message": "No matching operator found. Retry or add operator."}
    except Exception as e:
        return 500, {"message": str(e)}

    return 200, operators


@router.get("/operators/{operator_id}", response={200: OperatorOut, codes_4xx: Message})
@authorize(AppRole.get_all_authorized_roles())
def get_operator(request, operator_id: int):
    try:
        operator = get_object_or_404(Operator, id=operator_id)
    except Exception as e:
        return 404, {"message": "No matching operator found"}
    return 200, operator


@router.get("/operators/{operator_id}/user-operators", response=list[SelectUserOperatorStatus])
@authorize(AppRole.get_all_authorized_roles())
def list_user_operators_status_of_operator(request, operator_id: int):
    qs = UserOperator.objects.filter(operator=operator_id)
    return qs


##### POST #####


##### PUT #####


@router.put("/operators/{operator_id}", response={200: OperatorOut, codes_4xx: Message})
@authorize(AppRole.get_authorized_irc_roles())
def update_operator(request, operator_id: int, payload: OperatorIn):
    operator = get_object_or_404(Operator, id=operator_id)
    user: User = request.current_user
    operator.status = payload.status
    if operator.status in [Operator.Statuses.APPROVED, Operator.Statuses.REJECTED]:
        operator.is_new = False
        operator.verified_at = datetime.now(pytz.utc)
        operator.verified_by_id = user.user_guid

    operator.save()
    operator.set_create_or_update(modifier=user)

    return 200, operator


##### DELETE #####
