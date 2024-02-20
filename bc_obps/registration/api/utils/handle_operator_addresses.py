from registration.models import Address
from typing import  Optional


class AddressesData:
    physical_street_address: str
    physical_municipality: str
    physical_province: str
    physical_postal_code: str
    mailing_address_same_as_physical: bool
    mailing_street_address: Optional[str]
    mailing_municipality: Optional[str]
    mailing_province: Optional[str]
    mailing_postal_code: Optional[str]


def handle_operator_addresses(address_data: AddressesData, physical_address_id, mailing_address_id, prefix=""):
    # create or update physical address record
    physical_address, _ = Address.objects.update_or_create(
        id=physical_address_id,
        defaults={
            "street_address": address_data.get(f'{prefix}physical_street_address'),
            "municipality": address_data.get(f'{prefix}physical_municipality'),
            "province": address_data.get(f'{prefix}physical_province'),
            "postal_code": address_data.get(f'{prefix}physical_postal_code'),
        },
    )
    if address_data.get(f'{prefix}mailing_address_same_as_physical'):
        mailing_address = physical_address
    else:
        # create or update mailing address record if mailing address is not the same as the physical address
        mailing_address, _ = Address.objects.update_or_create(
            id=mailing_address_id,
            defaults={
                "street_address": address_data.get(f'{prefix}mailing_street_address'),
                "municipality": address_data.get(f'{prefix}mailing_municipality'),
                "province": address_data.get(f'{prefix}mailing_province'),
                "postal_code": address_data.get(f'{prefix}mailing_postal_code'),
            },
        )
    return {"physical_address": physical_address, "mailing_address": mailing_address}
