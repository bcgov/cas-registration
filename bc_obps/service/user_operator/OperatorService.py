from registration.api.utils.operator_utils import save_operator
from registration.schema import (
    UserOperatorOperatorIn,
)
from django.shortcuts import get_object_or_404

from registration.models import (
    Operator,
    User,
    UserOperator,
)
from django.db import transaction

from uuid import UUID
from registration.api.utils.operator_utils import save_operator
import pytz
from registration.schema import (
    UserOperatorOut,
    UserOperatorOperatorIn,
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
from registration.decorators import handle_http_errors


class OperatorService:
    @staticmethod
    @handle_http_errors()
    @transaction.atomic()
    def create_operator_and_user_operator(request, payload: UserOperatorOperatorIn):

        cra_business_number: str = payload.cra_business_number
        user: User = request.current_user
        existing_operator: Operator = Operator.objects.filter(cra_business_number=cra_business_number).first()
        # check if operator with this CRA Business Number already exists
        if existing_operator:
            return 400, {"message": "Operator with this CRA Business Number already exists."}
        operator_instance: Operator = Operator(
            cra_business_number=cra_business_number,
            bc_corporate_registry_number=payload.bc_corporate_registry_number,
            # treating business_structure as a foreign key
            business_structure=payload.business_structure,
            # This used to default to 'Draft' but now defaults to 'Pending' since we removed page 2 of the user operator form
            status=Operator.Statuses.PENDING,
        )
        # save operator data
        return save_operator(payload, operator_instance, user)

    @staticmethod
    @handle_http_errors()
    @transaction.atomic()
    def update_operator_and_user_operator(request, payload: UserOperatorOperatorIn, user_operator_id: UUID):
        user: User = request.current_user
        user_operator_instance: UserOperator = get_object_or_404(UserOperator, id=user_operator_id, user=user)
        operator_instance: Operator = user_operator_instance.operator
        # Check cra_business_number for uniqueness except for the current operator
        cra_business_number: str = payload.cra_business_number
        existing_operator: Operator = (
            Operator.objects.filter(cra_business_number=cra_business_number).exclude(id=operator_instance.id).exists()
        )
        # check if operator with this CRA Business Number already exists
        if existing_operator:
            return 400, {"message": "Operator with this CRA Business Number already exists."}
        if operator_instance.status == 'Draft':
            operator_instance.status = 'Pending'

        # save operator data
        return save_operator(payload, operator_instance, user)

    @staticmethod
    @handle_http_errors()
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
        user_operator.status = payload.status

        operator: Operator = user_operator.operator
        updated_role = payload.role

        if user_operator.status in [UserOperator.Statuses.APPROVED, UserOperator.Statuses.DECLINED]:
            user_operator.verified_at = datetime.now(pytz.utc)
            user_operator.verified_by_id = current_user.user_guid

            if user_operator.status == UserOperator.Statuses.APPROVED and updated_role != UserOperator.Roles.PENDING:
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
                created_by=user_operator.user, business_role=BusinessRole.objects.get(role_name='Senior Officer')
            ).delete()
        return UserOperatorOut.from_orm(user_operator)
