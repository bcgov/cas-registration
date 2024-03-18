from uuid import UUID

from registration.models import (
    UserOperator,
)


class GetUserOperatorAdminExistsService:
    def get_user_operator_admin_exists(request, operator_id: UUID):
        has_admin = UserOperator.objects.filter(
            operator_id=operator_id, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
        ).exists()
        return 200, has_admin
