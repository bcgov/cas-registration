from registration.utils import (
    check_access_request_matches_business_guid,
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
from registration.decorators import handle_http_errors


class RequestAccessService:
    @staticmethod
    @handle_http_errors()
    @transaction.atomic()
    def request_access(request, payload: SelectOperatorIn):
        user: User = request.current_user
        operator: Operator = get_object_or_404(Operator, id=payload.operator_id)
        status, message = check_access_request_matches_business_guid(user.user_guid, operator)
        if status != 200:
            return status, message

        # Making a draft UserOperator instance if one doesn't exist
        user_operator, created = UserOperator.objects.get_or_create(
            user=user, operator=operator, status=UserOperator.Statuses.PENDING, role=UserOperator.Roles.PENDING
        )
        if created:
            user_operator.set_create_or_update(user.pk)
        return 201, {"user_operator_id": user_operator.id, "operator_id": user_operator.operator.id}
