from uuid import UUID
from typing import List

from ninja.types import DictStrAny

from registry.models import Account


class AccountDataAccessService:
    @classmethod
    def get_by_id(cls, account_id: UUID) -> Account:
        return Account.objects.get(id=account_id)

    @classmethod
    def get_all_accounts(cls) -> List[Account]:
        return Account.objects.all()

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