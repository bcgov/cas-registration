from registration.models import Address
from ninja.types import DictStrAny
from typing import Optional


class AddressDataAccessService:
    @classmethod
    def create_address(
        cls,
        address_data: DictStrAny,
    ) -> Address:
        address = Address.objects.create(
            **address_data,
        )
        return address

    @classmethod
    def upsert_address_from_data(
        cls,
        address_data: DictStrAny,
        address_id: Optional[int],
    ) -> Address:
        address, _ = Address.objects.update_or_create(
            id=address_id,
            defaults={**address_data},
        )
        return address
