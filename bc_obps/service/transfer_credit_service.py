from typing import Optional
from uuid import UUID

from django.db.models import QuerySet
from ninja import Query
from ninja.types import DictStrAny

from registry.models import Transfer
from registry.schema.transfer import TransferFilterSchema
from service.data_access_service.transfer_credit_service import TransferCreditDataAccessService


class TransferCreditService:
    @classmethod
    def list_transfers(
        cls,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: TransferFilterSchema = Query(...),
    ) -> QuerySet[Transfer]:
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field or 'initiated_datetime'}"
        base_qs = TransferCreditDataAccessService.get_all_transfers()
        return filters.filter(base_qs).order_by(sort_by)

    @classmethod
    def create_transfer(cls, user_guid: UUID, transfer_data: DictStrAny) -> Transfer:
        return TransferCreditDataAccessService.create_transfer(user_guid, transfer_data)

    @classmethod
    def update_transfer(cls, user_guid: UUID, transfer_id: int, transfer_data: DictStrAny) -> Transfer:
        del user_guid
        return TransferCreditDataAccessService.update_transfer(transfer_id, transfer_data)
