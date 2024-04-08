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
        return UserOperator.objects.get(id=user_operator_id)

    def get_admin_users(operator_id: UUID, desired_status: UserOperator.Statuses):
        operator = Operator.objects.get(id=operator_id)
        user_operators = UserOperator.objects.filter(
            operator=operator, role=UserOperator.Roles.ADMIN, status=desired_status
        )
        admin_users = User.objects.filter(user_guid__in=user_operators.values('user_id'))

        return admin_users

    def get_an_operators_user_operators_by_user_guid(user_guid: UUID):
        user_business_guid = UserDataAccessService.get_user_business_guid(user_guid)
        operator = (
            UserOperator.objects.select_related("operator")
            .exclude(status=UserOperator.Statuses.DECLINED)
            .get(user=user_guid)
            .operator
        )
        user_operator_list = UserOperator.objects.select_related("user").filter(
            operator_id=operator.id, user__business_guid=user_business_guid
        )
        return user_operator_list

    @transaction.atomic()
    def get_or_create_user_operator(user_guid: UUID, operator_id: UUID):
        """Function to create a user_operator. (Used when an operator already exists. If you need to create a user_operator and operator at the same time, see the user_operator_service.)"""
        operator = OperatorDataAccessService.get_operator_by_id(operator_id)
        user_operator, created = UserOperator.objects.get_or_create(
            user_id=user_guid,
            operator=operator,
            status=UserOperator.Statuses.PENDING,
            role=UserOperator.Roles.PENDING,
        )
        if created:
            user_operator.set_create_or_update(user_guid)
        return user_operator
