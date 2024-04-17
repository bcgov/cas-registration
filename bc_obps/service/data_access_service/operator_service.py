from typing import List
from registration.models import Operator, UserOperator
from uuid import UUID
from registration.models import Operator, UserOperator


class OperatorDataAccessService:
    def get_operator_by_id(operator_id: UUID) -> Operator:
        return Operator.objects.get(id=operator_id)

    def get_operator_by_user_operator_id(user_operator_id: UUID) -> Operator:
        from service.data_access_service.user_operator_service import UserOperatorDataAccessService

        user_operator = UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
        return Operator.objects.get(id=user_operator.operator.id)

    def get_operators_business_guid(operator_id: UUID) -> UUID:
        from service.data_access_service.user_operator_service import UserOperatorDataAccessService

        approved_admin_users = UserOperatorDataAccessService.get_admin_users(
            operator_id, UserOperator.Statuses.APPROVED
        )
        if not approved_admin_users:
            raise Exception('This operator does not have a business guid yet.')
        # all approved admins will have the same business_guid so we can use first one
        return approved_admin_users.first().business_guid

    def get_operators_by_cra_number(cra_business_number: int) -> List[Operator]:
        return Operator.objects.exclude(status=Operator.Statuses.DECLINED).get(cra_business_number=cra_business_number)

    def get_operators_by_legal_name(legal_name: str) -> List[Operator]:
        return (
            Operator.objects.exclude(status=Operator.Statuses.DECLINED)
            .filter(legal_name__icontains=legal_name)
            .order_by("legal_name")
        )
