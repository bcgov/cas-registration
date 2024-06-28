from registration.models import Address
from ninja.types import DictStrAny


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
