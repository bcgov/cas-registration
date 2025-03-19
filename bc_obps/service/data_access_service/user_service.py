from typing import Dict
from uuid import UUID
from registration.schema import UserIn, UserUpdateIn, UserOut
from registration.models import AppRole, Operator, UserOperator, User


class UserDataAccessService:
    @classmethod
    def get_by_guid(cls, user_guid: UUID) -> User:
        return User.objects.get(user_guid=user_guid)

    @classmethod
    def get_user_business_guid(cls, user_guid: UUID) -> UUID:
        return User.objects.get(user_guid=user_guid).business_guid

    @classmethod
    def get_operator_by_user(cls, user_guid: UUID) -> Operator:
        user_operator = UserDataAccessService.get_user_operator_by_user(user_guid)
        return user_operator.operator

    @classmethod
    def get_user_operator_by_user(cls, user_guid: UUID) -> UserOperator:

        user_operator = (
            UserOperator.objects.only("id", "status", "operator__id", "operator__is_new", "operator__status")
            .exclude(
                status=UserOperator.Statuses.DECLINED
            )  # We exclude declined user_operators because the user may have previously requested access and been declined and therefore have multiple records in the user_operator table
            .select_related("operator")
            .get(user_id=user_guid)
        )
        return user_operator

    @classmethod
    def is_user_an_approved_admin_user_operator(cls, user_guid: UUID) -> Dict[str, bool]:
        approved_user_operator: bool = UserOperator.objects.filter(
            user_id=user_guid, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
        ).exists()
        return {"approved": approved_user_operator}

    @classmethod
    def is_users_user_operator_declined(cls, user_guid: UUID, operator_id: UUID) -> bool:
        is_declined = UserOperator.objects.filter(
            operator_id=operator_id, user_id=user_guid, status=UserOperator.Statuses.DECLINED
        ).exists()
        return is_declined

    @classmethod
    def get_app_role(cls, user_guid: UUID) -> AppRole:
        return User.objects.only('app_role').select_related('app_role').get(user_guid=user_guid).app_role

    @classmethod
    def get_user_profile(cls, user_guid: UUID) -> User:
        return User.objects.only(*UserOut.Meta.fields, "app_role").select_related('app_role').get(user_guid=user_guid)

    @classmethod
    def create_user(cls, user_guid: UUID, role: AppRole, user_data: UserIn) -> User:
        return User.objects.create(
            user_guid=user_guid,
            business_guid=user_data.business_guid,  # type: ignore[attr-defined]
            bceid_business_name=user_data.bceid_business_name,  # type: ignore[attr-defined]
            app_role=role,
            first_name=user_data.first_name,  # type: ignore[attr-defined]
            last_name=user_data.last_name,  # type: ignore[attr-defined]
            email=user_data.email,  # type: ignore[attr-defined]
            position_title=user_data.position_title,  # type: ignore[attr-defined]
            phone_number=user_data.phone_number,  # type: ignore[attr-defined]
        )

    @classmethod
    def update_user(cls, user_guid: UUID, updated_data: UserUpdateIn) -> User:
        user: User = UserDataAccessService.get_by_guid(user_guid)
        for attr, value in updated_data.dict().items():
            setattr(user, attr, value)
        user.save()
        return user

    @classmethod
    def user_has_access_to_operator(cls, user_guid: UUID, operator_id: UUID) -> bool:
        user = UserDataAccessService.get_by_guid(user_guid)
        return user.user_operators.filter(operator_id=operator_id, status=UserOperator.Statuses.APPROVED).exists()
