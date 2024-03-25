from uuid import UUID
from registration.schema import (
    UserOperatorOut,
)

from registration.models import (
    User,
    UserOperator,
)


class GetUserOperatorService:
    def get_user_operator(request, user_operator_id: UUID):
        user: User = request.current_user
        if user.is_industry_user():
            # Industry users can only get their own UserOperator instance
            try:
                user_operator = UserOperator.objects.select_related('operator').get(
                    id=user_operator_id, user=user.user_guid
                )
            except UserOperator.DoesNotExist:
                return 404, {"message": "No matching userOperator found"}
            return UserOperatorOut.from_orm(user_operator)
        else:
            try:
                user_operator = UserOperator.objects.select_related('operator').get(id=user_operator_id)
            except UserOperator.DoesNotExist:
                return 404, {"message": "No matching userOperator found"}
            return UserOperatorOut.from_orm(user_operator)
