from uuid import UUID
from typing import List

from django.db.models import IntegerField, Q, QuerySet, Sum
from django.db.models.functions import Coalesce
from ninja.types import DictStrAny

from registry.models import Account, Unit


class AccountDataAccessService:
    @classmethod
    def get_by_id(cls, account_id: UUID) -> Account:
        return cls._with_unit_quantities(Account.objects.filter(id=account_id)).get()

    @classmethod
    def get_all_accounts(cls) -> QuerySet[Account]:
        return cls._with_unit_quantities(Account.objects.all())

    @staticmethod
    def _with_unit_quantities(accounts: QuerySet[Account]) -> QuerySet[Account]:
        return accounts.annotate(
            issued_quantity=Coalesce(
                Sum(
                    "issuance__issuance__quantity",
                    filter=Q(issuance__issuance__status=Unit.Status.ISSUED),
                ),
                0,
                output_field=IntegerField(),
            ),
            active_quantity=Coalesce(
                Sum(
                    "issuance__issuance__quantity",
                    filter=Q(issuance__issuance__status=Unit.Status.ACTIVE),
                ),
                0,
                output_field=IntegerField(),
            ),
            retired_quantity=Coalesce(
                Sum(
                    "issuance__issuance__quantity",
                    filter=Q(issuance__issuance__status=Unit.Status.RETIRED),
                ),
                0,
                output_field=IntegerField(),
            ),
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