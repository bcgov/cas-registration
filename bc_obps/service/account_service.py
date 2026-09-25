from typing import Optional

from django.db.models import QuerySet
from registry.schema.account import AccountFilterSchema
from ninja import Query
from registry.models.account import Account
from service.data_access_service.account_service import AccountDataAccessService


class AccountService:
    # @classmethod
    # def get_if_authorized(cls, user_guid: UUID) -> Optional[Account]:
    #     user = UserDataAccessService.get_by_guid(user_guid)
    #     user_accounts = 

    @classmethod
    def list_accounts(cls, sort_field: Optional[str], sort_order: Optional[str], filters: AccountFilterSchema = Query(...),) -> QuerySet[Account]:
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = AccountDataAccessService.get_all_accounts()

        return filters.filter(base_qs).order_by(sort_by)