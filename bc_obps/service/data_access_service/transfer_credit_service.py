from typing import Any, Dict
from uuid import UUID

from django.db.models import QuerySet
from ninja.types import DictStrAny

from registry.models import Transfer


class TransferCreditDataAccessService:
    @classmethod
    def get_all_transfers(cls) -> QuerySet[Transfer]:
        return (
            Transfer.objects.select_related(
                "source_account",
                "destination_account",
                "project",
                "requested_by",
                "reviewed_by",
                "unit",
            )
            .all()
        )

    @classmethod
    def get_by_id(cls, transfer_id: int) -> Transfer:
        return Transfer.objects.get(id=transfer_id)

    @classmethod
    def create_transfer(cls, user_guid: UUID, transfer_data: DictStrAny) -> Transfer:
        transfer_payload: Dict[str, Any] = dict(transfer_data)
        transfer_payload["requested_by_id"] = user_guid
        transfer_payload["created_by_id"] = user_guid
        return Transfer.objects.create(**transfer_payload)

    @classmethod
    def update_transfer(cls, transfer_id: int, transfer_data: DictStrAny) -> Transfer:
        transfer = cls.get_by_id(transfer_id)
        for key, value in transfer_data.items():
            setattr(transfer, key, value)
        transfer.save(update_fields=transfer_data.keys())
        return transfer
