from registration.models import (
    UserOperator,
)


class IsApprovedAdminUserOperatorService:
    def is_approved_admin_user_operator(request, user_guid: str):
        approved_user_operator: bool = UserOperator.objects.filter(
            user_id=user_guid, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
        ).exists()

        return 200, {"approved": approved_user_operator}
