from typing import Optional, Tuple
from uuid import UUID
from service.data_access_service.user_service import UserDataAccessService
from registration.models import Operator, User, UserOperator
from django.db import transaction
from django.db.models import QuerySet, Q, OuterRef, Exists


class UserOperatorDataAccessService:
    @classmethod
    def get_user_operator_by_id(cls, user_operator_id: UUID) -> UserOperator:
        return UserOperator.objects.get(id=user_operator_id)

    @classmethod
    def get_admin_users(cls, operator_id: UUID, desired_status: UserOperator.Statuses) -> QuerySet[User]:
        operator = Operator.objects.get(id=operator_id)
        user_operators = UserOperator.objects.filter(
            operator=operator, role=UserOperator.Roles.ADMIN, status=desired_status
        )
        admin_users = User.objects.filter(user_guid__in=user_operators.values('user_id'))

        return admin_users

    @classmethod
    def get_an_operators_user_operators_by_user_guid(cls, user_guid: UUID) -> QuerySet[UserOperator]:
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

    @classmethod
    @transaction.atomic()
    def get_or_create_user_operator(cls, user_guid: UUID, operator_id: UUID) -> Tuple[UserOperator, bool]:
        """Function to get or create a user_operator. (Used when an operator already exists. If you need to create a user_operator and operator at the same time, see the user_operator_service.)"""
        user_operator, created = UserOperator.objects.get_or_create(
            user_id=user_guid,
            operator_id=operator_id,
            status=UserOperator.Statuses.PENDING,
            role=UserOperator.Roles.PENDING,
        )

        return user_operator, created

    @classmethod
    def get_approved_user_operator(cls, user: User) -> Optional[UserOperator]:
        """
        Return the approved UserOperator record associated with the user.
        Based on the Constraint, there should only be one UserOperator associated with a user and operator.
        """
        return user.user_operators.only("operator_id").filter(status=UserOperator.Statuses.APPROVED).first()

    @classmethod
    def get_admin_user_operator_requests_for_irc_users(cls) -> QuerySet[UserOperator]:
        # Base query excluding operators with status 'Declined'
        qs = UserOperator.objects.select_related("user", "operator").exclude(
            operator__status=Operator.Statuses.DECLINED
        )
        # Subquery to check if an approved admin user exists for the operator
        approved_admin_operator_exists = UserOperator.objects.filter(
            operator=OuterRef('operator'), role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
        )
        # Condition 1: Include all `Admin` roles with any status (Approved, Declined, or Pending)
        admin_condition = Q(role=UserOperator.Roles.ADMIN)
        # Condition 2: Include `Pending` roles only if the operator doesn't have an approved admin user operator
        pending_condition = Q(role=UserOperator.Roles.PENDING) & ~Exists(approved_admin_operator_exists)

        # Condition 3: Exclude all `Reporter` roles regardless of status
        reporter_exclusion = Q(role=UserOperator.Roles.REPORTER)

        # Include all Admin roles OR Include Pending roles only if no approved admin exists for operator, Exclude Reporter roles
        return qs.filter(admin_condition | pending_condition).exclude(reporter_exclusion)
