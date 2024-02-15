from typing import List, Optional
from registration.decorators import authorize
from .api_base import router
from django.shortcuts import get_object_or_404
from registration.models import AppRole, Operator, UserOperator, User
from ninja.responses import codes_4xx, codes_5xx
from registration.schema import Message, OperatorOut, OperatorIn
from datetime import datetime
import pytz
from django.db import transaction
from registration.utils import (
    generate_useful_error,
)
from django.core.exceptions import ValidationError


##### GET #####


@router.get(
    "/operators",
    response={200: OperatorOut, codes_4xx: Message, codes_5xx: Message},
    url_name="get_operator_by_legal_name_or_cra",
)
@authorize(AppRole.get_all_app_roles(), UserOperator.get_all_industry_user_operator_roles())
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


@router.get(
    "/operators/legal-name",
    response={200: List[OperatorOut], codes_4xx: Message, codes_5xx: Message},
    url_name="get_operators_by_legal_name",
)
def get_operators_by_legal_name(request, search_value: Optional[str] = None):
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


@router.get("/operators/{operator_id}", response={200: OperatorOut, codes_4xx: Message}, url_name="get_operator")
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def get_operator(request, operator_id: int):
    try:
        operator = get_object_or_404(Operator, id=operator_id)
    except Exception as e:
        return 404, {"message": "No matching operator found"}
    return 200, operator


##### POST #####


##### PUT #####


@router.put("/operators/{operator_id}", response={200: OperatorOut, codes_4xx: Message}, url_name="update_operator")
@authorize(AppRole.get_authorized_irc_roles())
def update_operator(request, operator_id: int, payload: OperatorIn):
    operator = get_object_or_404(Operator, id=operator_id)
    user: User = request.current_user
    try:
        with transaction.atomic():
            operator.status = payload.status
            if operator.status in [Operator.Statuses.APPROVED, Operator.Statuses.DECLINED]:
                operator.is_new = False
                operator.verified_at = datetime.now(pytz.utc)
                operator.verified_by_id = user.user_guid

            operator.save()
            operator.set_create_or_update(user.pk)
            return 200, operator
    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}


##### DELETE #####
