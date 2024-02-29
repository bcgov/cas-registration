from typing import List, Optional, Union
from uuid import UUID
from registration.decorators import authorize
from .api_base import router
from django.shortcuts import get_object_or_404
from registration.models import AppRole, Operator, UserOperator, User
from ninja.responses import codes_4xx, codes_5xx
from registration.schema import Message, OperatorOut, OperatorIn, OperatorSearchOut, ConfirmSelectedOperatorOut
from django.db import transaction
from registration.utils import (
    generate_useful_error,
    set_verification_columns,
)
from django.core.exceptions import ValidationError


##### GET #####


@router.get(
    "/operators",
    response={200: Union[List[OperatorSearchOut], OperatorSearchOut], codes_4xx: Message, codes_5xx: Message},
    url_name="get_operators_by_cra_number_or_legal_name",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def get_operators_by_cra_number_or_legal_name(
    request, cra_business_number: Optional[int] = None, legal_name: Optional[str] = ""
):
    if not cra_business_number and not legal_name:
        return 404, {"message": "No search value provided"}
    if cra_business_number:
        try:
            operator = Operator.objects.exclude(status=Operator.Statuses.DECLINED).get(
                cra_business_number=cra_business_number
            )
            return 200, OperatorSearchOut.from_orm(operator)
        except Operator.DoesNotExist:
            return 404, {"message": "No matching operator found. Retry or add operator."}
    elif legal_name:
        operators = (
            Operator.objects.exclude(status=Operator.Statuses.DECLINED)
            .filter(legal_name__icontains=legal_name)
            .order_by("legal_name")
        )
        return 200, [OperatorSearchOut.from_orm(operator) for operator in operators]
    return 404, {"message": "No matching operator found. Retry or add operator."}


# We have to let unapproved users to reach this endpoint otherwise they can't see operator info when they select it
@router.get(
    "/operators/{operator_id}", response={200: ConfirmSelectedOperatorOut, codes_4xx: Message}, url_name="get_operator"
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def get_operator(request, operator_id: UUID):
    try:
        operator = get_object_or_404(Operator, id=operator_id)
    except Exception:
        return 404, {"message": "No matching operator found"}
    return 200, operator


##### POST #####


##### PUT #####


@router.put(
    "/operators/{operator_id}", response={200: OperatorOut, codes_4xx: Message}, url_name="update_operator_status"
)
@authorize(AppRole.get_authorized_irc_roles())
def update_operator_status(request, operator_id: UUID, payload: OperatorIn):
    operator = get_object_or_404(Operator, id=operator_id)
    user: User = request.current_user
    try:
        with transaction.atomic():
            operator.status = payload.status
            # when new operators are declined, their prime admin should be declined too
            user_operator = get_object_or_404(UserOperator, id=payload.user_operator_id)
            if operator.is_new and operator.status == Operator.Statuses.DECLINED:
                user_operator.status = UserOperator.Statuses.DECLINED
                set_verification_columns(user_operator, user.user_guid)
                user_operator.save()

            if operator.status in [Operator.Statuses.APPROVED, Operator.Statuses.DECLINED]:
                operator.is_new = False
                set_verification_columns(operator, user.user_guid)

            operator.save()
            operator.set_create_or_update(user.pk)
            return 200, operator
    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}


##### DELETE #####
