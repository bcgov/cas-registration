from uuid import UUID

from registration.models import (
    UserOperator,
)
from registration.decorators import handle_http_errors


class GetUserOperatorAdminExistsService:
    @staticmethod
    @handle_http_errors()
    def get_user_operator_admin_exists(request, operator_id: UUID):
        has_admin = UserOperator.objects.filter(
            operator_id=operator_id, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
        ).exists()
        return 200, has_admin
