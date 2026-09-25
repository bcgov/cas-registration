from uuid import UUID
from typing import List
from registry.models import Account

class AccountDataAccessService:
    @classmethod
    def get_by_id(cls, account_id: UUID) -> Account:
        return Account.objects.get(id=account_id)

    @classmethod
    def get_all_accounts(cls) -> List[Account]:
        return Account.objects.all()