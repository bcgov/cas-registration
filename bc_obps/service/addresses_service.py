from registration.models import Address
from typing import Optional


class AddressesService:
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

    """
    This function creates or updates addresses. It handles records that have different physical or mailing addresses. It also handles address data that comes in with a prefix (e.g. physical_street_address vs. po_physical_street_address).

    Arguments:
        address_data: This is the address information including street, postal code, etc.
        physical_address_id: This is the id of the physical address record if an address record already exists.
        mailing_address_id: This is the id of the mailing address record if an address record already exists. If physical and mailing address are the same, this id is the same as the physical_address_id
        prefix: Sometimes address data contains a prefix. For example, parent operator address keys contain `po` (e.g. po_mailing_street_address). This function strips out the prefix if included.

    Returns the physical and mailing address information.

    """

    def upsert_addresses_from_data(address_data: AddressesData, physical_address_id, mailing_address_id, prefix=""):
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
            # if mailing_address_same_as_physical == False but the ids match, it means that the user previously set the addresses to the same but now has added a mailing address
            if physical_address_id == mailing_address_id:
                mailing_address = Address.objects.create(
                    street_address=address_data.get(f'{prefix}mailing_street_address'),
                    municipality=address_data.get(f'{prefix}mailing_municipality'),
                    province=address_data.get(f'{prefix}mailing_province'),
                    postal_code=address_data.get(f'{prefix}mailing_postal_code'),
                )
            else:
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
