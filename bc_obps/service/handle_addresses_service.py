from registration.api.utils.operator_utils import AddressesData
from registration.models import Address


class HandleAddressesService:
    # brianna we need a data access service for addresses
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
