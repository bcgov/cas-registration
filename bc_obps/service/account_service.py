from typing import Optional
from uuid import UUID

from django.db.models import QuerySet
from ninja import Query
from ninja.types import DictStrAny

from registry.models.account import Account
from registry.schema.account import AccountFilterSchema
from service.data_access_service.account_service import AccountDataAccessService


class AccountService:
    @classmethod
    def list_accounts(cls, sort_field: Optional[str], sort_order: Optional[str], filters: AccountFilterSchema = Query(...),) -> QuerySet[Account]:
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = AccountDataAccessService.get_all_accounts()

        return filters.filter(base_qs).order_by(sort_by)

    @classmethod
    def create_account(cls, user_guid: UUID, account_data: DictStrAny) -> Account:
        return AccountDataAccessService.create_account(user_guid, account_data)

    @classmethod
    def create_sub_account(cls, user_guid: UUID, parent_account_id: int, account_data: DictStrAny) -> Account:
        return AccountDataAccessService.create_sub_account(user_guid, parent_account_id, account_data)