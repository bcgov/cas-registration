import pytest
from model_bakery import baker
from registration.models import Address

pytestmark = pytest.mark.django_db


class TestAddressService:
    @staticmethod
    def test_upsert_addresses_from_data_create_without_prefix():
        from service.addresses_service import AddressesService

        address_data = {
            "physical_street_address": "123 Main St",
            "physical_municipality": "Anytown",
            "physical_province": "MB",
            "physical_postal_code": "A1B 2C3",
            "mailing_address_same_as_physical": False,
            "mailing_street_address": "456 Secondary St",
            "mailing_municipality": "Othertown",
            "mailing_province": "BC",
            "mailing_postal_code": "X1Y 2Z3",
        }

        result = AddressesService.upsert_addresses_from_data(address_data, None, None)

        assert len(Address.objects.all()) == 2
        assert Address.objects.all()[0] == result['physical_address']
        assert Address.objects.all()[0].street_address == "123 Main St"
        assert Address.objects.all()[1] == result['mailing_address']
        assert Address.objects.all()[1].postal_code == "X1Y 2Z3"

    @staticmethod
    def test_upsert_addresses_from_data_update_with_prefix():
        from service.addresses_service import AddressesService

        existing_physical_address = baker.make(Address)
        existing_mailing_address = baker.make(Address)

        address_data = {
            "po_physical_street_address": "123 Main St",
            "po_physical_municipality": "Anytown",
            "po_physical_province": "MB",
            "po_physical_postal_code": "A1B 2C3",
            "po_mailing_address_same_as_physical": False,
            "po_mailing_street_address": "456 Secondary St",
            "po_mailing_municipality": "Othertown",
            "po_mailing_province": "BC",
            "po_mailing_postal_code": "X1Y 2Z3",
        }

        AddressesService.upsert_addresses_from_data(
            address_data, existing_physical_address.id, existing_mailing_address.id, 'po_'
        )

        assert len(Address.objects.all()) == 2
        assert Address.objects.get(id=existing_physical_address.id).street_address == "123 Main St"
        assert Address.objects.get(id=existing_mailing_address.id).postal_code == "X1Y 2Z3"

    @staticmethod
    def test_upsert_addresses_from_data__add_mailing_address():
        from service.addresses_service import AddressesService

        existing_physical_address = baker.make(Address)
        existing_mailing_address = existing_physical_address

        address_data = {
            "po_physical_street_address": "Physical address",
            "po_physical_municipality": "Sometown",
            "po_physical_province": "ON",
            "po_physical_postal_code": "D4E 5F6",
            "po_mailing_address_same_as_physical": False,
            "po_mailing_street_address": "Mailing address",
            "po_mailing_municipality": "Sometown",
            "po_mailing_province": "ON",
            "po_mailing_postal_code": "D4E 5F6",
        }

        AddressesService.upsert_addresses_from_data(
            address_data, existing_physical_address.id, existing_mailing_address.id, 'po_'
        )

        assert len(Address.objects.all()) == 2
        assert Address.objects.get(street_address="Physical address") is not None
        assert Address.objects.get(street_address="Mailing address") is not None
