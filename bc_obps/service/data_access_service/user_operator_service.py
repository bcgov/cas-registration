from uuid import UUID
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operator_service import OperatorDataAccessService
from registration.models import Operator, User, UserOperator
from django.db import transaction


from registration.models import (
    Operator,
    UserOperator,
)


class UserOperatorDataAccessService:
    def get_user_operator_by_id(user_operator_id: UUID):
        # brianna this is the optimized one?
        return UserOperator.objects.select_related('operator').get(id=user_operator_id)
        # return UserOperator.objects.get(id=user_operator_id)

    def get_approved_admin_users(operator_id: UUID):
        operator = Operator.objects.get(id=operator_id)
        approved_user_operators = UserOperator.objects.filter(
            operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
        )
        approved_users = User.objects.filter(user_guid__in=approved_user_operators.values('user_id'))

        return approved_users

    def get_pending_admin_users(operator_id: UUID):
        operator = Operator.objects.get(id=operator_id)

        pending_user_operators = UserOperator.objects.filter(
            operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.PENDING
        )
        pending_users = User.objects.filter(user_guid__in=pending_user_operators.values('user_id'))

        return pending_users

    def get_an_operators_user_operators_by_user_guid(user_business_guid: UUID):
        # brianna I don't think we need to additionally filter by operator here because how could anyone have a bus guid with a different operator?
        user_operator_list = UserOperator.objects.select_related("user").filter(user__business_guid=user_business_guid)
        return user_operator_list

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
