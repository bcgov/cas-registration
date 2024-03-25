from registration.models import (
    UserOperator,
)
from registration.decorators import handle_http_errors

class IsApprovedAdminUserOperatorService:
    @staticmethod 
    @handle_http_errors() 
    def is_approved_admin_user_operator(request, user_guid: str):
        approved_user_operator: bool = UserOperator.objects.filter(
            user_id=user_guid, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
        ).exists()

        return 200, {"approved": approved_user_operator}
