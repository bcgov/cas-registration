from uuid import UUID
from registration.api.utils.operator_utils import save_operator
from registration.schema.user_operator import UserOperatorOperatorIn
from service.user_service import UserDataAccessService
from service.operator_service import OperatorDataAccessService
from registration.models import Operator, User, UserOperator
from django.db import transaction
import pytz
from registration.schema import (
    UserOperatorOut,
)

from registration.models import (
    BusinessRole,
    Operator,
    UserOperator,
)
from datetime import datetime


class UserOperatorDataAccessService:
    def get_user_operator_by_id(user_operator_id: UUID):
        # brianna this is the optimized one??
        return UserOperator.objects.select_related('operator').get(id=user_operator_id)
        # return UserOperator.objects.get(id=user_operator_id)

    def get_approved_admin_users(operator_id: UUID):
        operator = Operator.objects.get(id=operator_id)
        approved_user_operators = UserOperator.objects.filter(
            operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
        )
        approved_users = User.objects.filter(user_guid__in=approved_user_operators.values('user_id'))

        return approved_users

    def get_pending_admins(operator_id: UUID):
        operator = Operator.objects.get(id=operator_id)

        return UserOperator.objects.filter(
            operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.PENDING
        )

    @transaction.atomic()
    def get_or_create_user_operator(user_guid: UUID, operator_id: UUID):
        "Function to create a user_operator (operator already exists in the system)"
        user = UserDataAccessService.get_user_by_guid(user_guid)
        operator = OperatorDataAccessService.get_operator_by_id(operator_id)
        user_operator, created = UserOperator.objects.get_or_create(
            user=user, operator=operator, status=UserOperator.Statuses.PENDING, role=UserOperator.Roles.PENDING
        )
        if created:
            user_operator.set_create_or_update(user.pk)
        return user_operator

    # brianna, the following three do more than just access the db so should they be another service (in the vein of application-access-service)
    @transaction.atomic()
    def create_operator_and_user_operator(updated_data: UserOperatorOperatorIn, user_guid: UUID):
        "Function to create a user_operator and an operator (new operator that doesn't exist yet)"
        user = UserDataAccessService.get_user_by_guid(user_guid)
        cra_business_number: str = updated_data.cra_business_number
        existing_operator: Operator = Operator.objects.filter(cra_business_number=cra_business_number).first()
        # check if operator with this CRA Business Number already exists
        if existing_operator:
            # i don't think we actually need to do this brianna, django will handle?
            raise ("Operator with this CRA Business Number already exists.")
        operator_instance: Operator = Operator(
            cra_business_number=cra_business_number,
            bc_corporate_registry_number=updated_data.bc_corporate_registry_number,
            # treating business_structure as a foreign key
            business_structure=updated_data.business_structure,
            # This used to default to 'Draft' but now defaults to 'Pending' since we removed page 2 of the user operator form
            status=Operator.Statuses.PENDING,
        )
        # save operator data
        # brianna save_operator should probably be in whatever additional service too
        return save_operator(updated_data, operator_instance, user)

    @transaction.atomic()
    def update_user_operator_status(user_operator_id: UUID, updated_data, user_guid: UUID):
        "Function to update only the user_operator status (operator is already in the system and therefore doesn't need to be approved/denied)"

        # We can't update the status of a user_operator if the operator has been declined or is awaiting review, or if the operator is new
        operator = OperatorDataAccessService.get_operator_by_user_operator_id(user_operator_id)
        if operator.status == Operator.Statuses.DECLINED or operator.is_new:
            raise ("Operator must be approved before approving or declining users.")

        user_operator = UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
        user_operator.status = updated_data.status

        operator: Operator = user_operator.operator
        updated_role = updated_data.role

        if user_operator.status in [UserOperator.Statuses.APPROVED, UserOperator.Statuses.DECLINED]:
            user_operator.verified_at = datetime.now(pytz.utc)
            user_operator.verified_by_id = user_guid

            if user_operator.status == UserOperator.Statuses.APPROVED and updated_role != UserOperator.Roles.PENDING:
                user_operator.role = updated_role

        elif user_operator.status == UserOperator.Statuses.PENDING:
            user_operator.verified_at = None
            user_operator.verified_by_id = None
            user_operator.role = UserOperator.Roles.PENDING

        user_operator.save(update_fields=["status", "verified_at", "verified_by_id", "role"])
        user_operator.set_create_or_update(user_guid.pk)
        if user_operator.status == UserOperator.Statuses.DECLINED:
            # Set role to pending for now but we may want to add a new role for declined
            user_operator.role = UserOperator.Roles.PENDING
            # hard delete contacts (Senior Officers) associated with the operator and the user who requested access
            user_operator.operator.contacts.filter(
                created_by=user_operator.user,
                business_role=BusinessRole.objects.get(role_name='Senior Officer'),
            ).delete()
        return UserOperatorOut.from_orm(user_operator)

    @transaction.atomic()
    def update_operator_and_user_operator(
        user_operator_id: UUID, updated_data: UserOperatorOperatorIn, user_guid: UUID
    ):
        "Function to update both the operator and user_operator"
        user_operator_instance = UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
        operator_instance: Operator = user_operator_instance.operator
        # Check cra_business_number for uniqueness except for the current operator
        cra_business_number: str = updated_data.cra_business_number
        existing_operator: Operator = (
            Operator.objects.filter(cra_business_number=cra_business_number).exclude(id=operator_instance.id).exists()
        )
        # check if operator with this CRA Business Number already exists
        if existing_operator:
            raise ("Operator with this CRA Business Number already exists.")
        if operator_instance.status == 'Draft':
            operator_instance.status = 'Pending'
        # save operator data
        return save_operator(updated_data, operator_instance, UserDataAccessService.get_user_by_guid(user_guid))
