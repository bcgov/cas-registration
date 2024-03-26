from registration.utils import (
    check_users_admin_request_eligibility,
)
from registration.schema import (
    SelectOperatorIn,
)
from django.shortcuts import get_object_or_404

from registration.models import (
    Operator,
    User,
    UserOperator,
)
from django.db import transaction


class RequestAdminAccessService:
    @transaction.atomic()
    def request_admin_access(request, payload: SelectOperatorIn):
        user: User = request.current_user
        operator: Operator = get_object_or_404(Operator, id=payload.operator_id)
        # check if user is eligible to request access
        status, message = check_users_admin_request_eligibility(user, operator)
        if status != 200:
            return status, message
        # Making a pending UserOperator instance if one doesn't exist
        user_operator, created = UserOperator.objects.get_or_create(
            user=user, operator=operator, role=UserOperator.Roles.PENDING, status=UserOperator.Statuses.PENDING
        )
        if created:
            user_operator.set_create_or_update(user.pk)
        return 201, {"user_operator_id": user_operator.id, "operator_id": user_operator.operator.id}
