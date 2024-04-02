from registration.models import Operator
from uuid import UUID


class OperatorDataAccessService:
    def get_operator_by_id(operator_id: UUID):
        return Operator.objects.get(id=operator_id)

    def get_operator_by_user_operator_id(user_operator_id: UUID):
        # brianna why circular import??
        from service.data_access_service.user_operator_service import UserOperatorDataAccessService

        user_operator = UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
        return Operator.objects.get(id=user_operator.operator.id)

    def get_operators_business_guid(operator_id: UUID):
        from service.data_access_service.user_operator_service import UserOperatorDataAccessService

        approved_admin_users = UserOperatorDataAccessService.get_approved_admin_users(operator_id)
        if not approved_admin_users:
            raise Exception('This operator does not have a business guid yet.')
        # all approved admins will have the same business_guid so we can use first one
        return approved_admin_users.first().business_guid
