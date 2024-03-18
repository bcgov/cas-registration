from django.db import transaction
from registration.utils import (
    generate_useful_error,
)
from django.core.exceptions import ValidationError
import pytz
from registration.schema import (
    UserOperatorOut,
    UserOperatorStatusUpdate,
)
from django.shortcuts import get_object_or_404

from registration.models import (
    BusinessRole,
    Operator,
    User,
    UserOperator,
)
from datetime import datetime


class UpdateStatusService:
    @transaction.atomic()
    def update_user_operator_status(request, payload: UserOperatorStatusUpdate):
        current_user: User = request.current_user  # irc user or industry user admin
        if payload.user_operator_id:  # to update the status of a user_operator by user_operator_id
            user_operator = get_object_or_404(UserOperator, id=payload.user_operator_id)
        else:
            return 404, {"message": "No parameters provided"}

        # We can't update the status of a user_operator if the operator has been declined or is awaiting review, or if the operator is new
        operator = get_object_or_404(Operator, id=user_operator.operator.id)
        if user_operator.operator.status == Operator.Statuses.DECLINED or operator.is_new:
            return 400, {"message": "Operator must be approved before approving or declining users."}
        try:
            with transaction.atomic():
                user_operator.status = payload.status

                operator: Operator = user_operator.operator
                updated_role = payload.role

                if user_operator.status in [UserOperator.Statuses.APPROVED, UserOperator.Statuses.DECLINED]:
                    user_operator.verified_at = datetime.now(pytz.utc)
                    user_operator.verified_by_id = current_user.user_guid

                    if (
                        user_operator.status == UserOperator.Statuses.APPROVED
                        and updated_role != UserOperator.Roles.PENDING
                    ):
                        user_operator.role = updated_role

                elif user_operator.status == UserOperator.Statuses.PENDING:
                    user_operator.verified_at = None
                    user_operator.verified_by_id = None
                    user_operator.role = UserOperator.Roles.PENDING

                user_operator.save(update_fields=["status", "verified_at", "verified_by_id", "role"])
                user_operator.set_create_or_update(current_user.pk)
                if user_operator.status == UserOperator.Statuses.DECLINED:
                    # Set role to pending for now but we may want to add a new role for declined
                    user_operator.role = UserOperator.Roles.PENDING
                    # hard delete contacts (Senior Officers) associated with the operator and the user who requested access
                    user_operator.operator.contacts.filter(
                        created_by=user_operator.user,
                        business_role=BusinessRole.objects.get(role_name='Senior Officer'),
                    ).delete()
                return UserOperatorOut.from_orm(user_operator)
        except ValidationError as e:
            return 400, {"message": generate_useful_error(e)}
        except Exception as e:
            return 400, {"message": str(e)}
