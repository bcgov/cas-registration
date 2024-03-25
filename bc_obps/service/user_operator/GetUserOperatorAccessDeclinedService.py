from uuid import UUID

from registration.models import (
    User,
    UserOperator,
)
from registration.decorators import handle_http_errors


class GetUserOperatorAccessDeclinedService:
    @staticmethod 
    @handle_http_errors() 
    def get_user_operator_access_declined(request, operator_id: UUID):
        user: User = request.current_user
        is_declined = UserOperator.objects.filter(
            operator_id=operator_id, user_id=user.user_guid, status=UserOperator.Statuses.DECLINED
        ).exists()
        return 200, is_declined
