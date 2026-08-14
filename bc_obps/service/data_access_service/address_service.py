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
            # A None id is the intentional "create" path; django-stubs 6.0 rejects None in lookups.
            id=address_id,  # type: ignore[misc]
            defaults={**address_data},
        )
        return address
