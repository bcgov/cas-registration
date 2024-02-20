from registration.models import Address
from typing import TypedDict, Optional


class AddressesData(TypedDict):
    physical_address_id: int
    physical_street_address: str
    physical_municipality: str
    physical_province: str
    physical_postal_code: str
    mailing_address_same_as_physical: bool
    mailing_address_id: Optional[int]
    mailing_street_address: Optional[str]
    mailing_municipality: Optional[str]
    mailing_province: Optional[str]
    mailing_postal_code: Optional[str]


def handle_operator_addresses(addressesData: AddressesData):
    # create or update physical address record
    physical_address, _ = Address.objects.update_or_create(
        id=addressesData.physical_address_id,
        defaults={
            "street_address": addressesData.physical_street_address,
            "municipality": addressesData.physical_municipality,
            "province": addressesData.physical_province,
            "postal_code": addressesData.physical_postal_code,
        },
    )
    if addressesData.mailing_address_same_as_physical:
        mailing_address = physical_address
    else:
        # create or update mailing address record if mailing address is not the same as the physical address
        mailing_address, _ = Address.objects.update_or_create(
            id=addressesData.mailing_address_id,
            defaults={
                "street_address": addressesData.mailing_street_address,
                "municipality": addressesData.mailing_municipality,
                "province": addressesData.mailing_province,
                "postal_code": addressesData.mailing_postal_code,
            },
        )

    return {"physical_address": physical_address, "mailing_address": mailing_address}
