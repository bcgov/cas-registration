from uuid import UUID

from django.db.models import QuerySet
from ninja.types import DictStrAny

from registry.models import Account
from service.data_access_service.unit_service import UnitDataAccessService


class AccountDataAccessService:
    @classmethod
    def get_by_id(cls, account_id: UUID) -> Account:
        return UnitDataAccessService.with_unit_quantities(
            Account.objects.filter(id=account_id), "issuance__issuance"
        ).get()

    @classmethod
    def get_all_accounts(cls) -> QuerySet[Account]:
        return UnitDataAccessService.with_unit_quantities(
            Account.objects.all(), "issuance__issuance"
        )

    @classmethod
    def create_account(cls, user_guid: UUID, account_data: DictStrAny) -> Account:
        return Account.objects.create(
            **account_data,
            created_by_id=user_guid,
        )

    @classmethod
    def create_sub_account(cls, user_guid: UUID, parent_account_id: int, account_data: DictStrAny) -> Account:
        parent_account = Account.objects.get(id=parent_account_id)
        sub_account_data = dict(account_data)
        sub_account_data["parent_account_id"] = parent_account.id
        sub_account_data.pop("parent_account", None)

        return Account.objects.create(
            **sub_account_data,
            created_by_id=user_guid,
        )