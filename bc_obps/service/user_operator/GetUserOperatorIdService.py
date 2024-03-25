from django.shortcuts import get_object_or_404

from registration.models import (
    UserOperator,
)
from registration.decorators import handle_http_errors


class GetUserOperatorIdService:
    @staticmethod 
    @handle_http_errors() 
    def get_user_operator_id(request):
        user_operator = get_object_or_404(UserOperator, user_id=request.current_user.user_guid)
        return 200, {"user_operator_id": user_operator.id}
