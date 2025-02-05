from django.db.models import QuerySet
from registration.utils import update_model_instance
from registration.models import Operator, User, UserOperator
from uuid import UUID
from ninja.types import DictStrAny


class OperatorDataAccessService:
    @classmethod
    def get_operator_by_id(cls, operator_id: UUID) -> Operator:
        return Operator.objects.get(id=operator_id)

    @classmethod
    def get_all_operators(cls) -> QuerySet[Operator]:
        return Operator.objects.exclude(status=Operator.Statuses.DECLINED)

    @classmethod
    def get_operator_by_user_operator_id(cls, user_operator_id: UUID) -> Operator:
        from service.data_access_service.user_operator_service import UserOperatorDataAccessService

        user_operator = UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
        return Operator.objects.get(id=user_operator.operator.id)

    @classmethod
    def get_operators_business_guid(cls, operator_id: UUID) -> UUID:
        from service.data_access_service.user_operator_service import UserOperatorDataAccessService

        approved_admin_users = UserOperatorDataAccessService.get_admin_users(
            operator_id, UserOperator.Statuses.APPROVED
        )
        if not approved_admin_users:
            raise Exception('This operator does not have a business guid yet.')
        # all approved admins will have the same business_guid so we can use first one
        first_approved_admin: User = approved_admin_users.first()  # type: ignore[assignment] # we know this will not be None
        return first_approved_admin.business_guid

    @classmethod
    def get_operators_by_cra_number(cls, cra_business_number: int) -> Operator:
        return Operator.objects.exclude(status=Operator.Statuses.DECLINED).get(cra_business_number=cra_business_number)

    @classmethod
    def get_operators_by_legal_name(cls, legal_name: str) -> QuerySet[Operator]:
        return (
            Operator.objects.exclude(status=Operator.Statuses.DECLINED)
            .filter(legal_name__icontains=legal_name)
            .order_by("legal_name")
        )

    @classmethod
    def update_operator(
        cls,
        user_guid: UUID,
        operator_id: UUID,
        operator_data: DictStrAny,
    ) -> Operator:
        operator = Operator.objects.get(pk=operator_id)
        update_model_instance(
            operator,
            operator_data.keys(),
            operator_data,
        )
        operator.save()
        return operator
