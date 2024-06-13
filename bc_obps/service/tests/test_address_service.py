from registration.schema.v1.parent_operator import ParentOperatorIn
from registration.schema.v1.user_operator import UserOperatorOperatorIn
import pytest
from model_bakery import baker
from registration.models import Address, BusinessStructure, Operator, ParentOperator, User

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

    @staticmethod
    def test_save_operator():
        from service.user_operator_service import UserOperatorService

        user = baker.make(User)
        operator_instance: Operator = Operator(
            cra_business_number=444444444,
            bc_corporate_registry_number="aaa1111111",
            business_structure=BusinessStructure.objects.first(),
            status=Operator.Statuses.PENDING,
        )
        payload = UserOperatorOperatorIn(
            legal_name="Example Legal Name",
            trade_name="Example Trade Name",
            cra_business_number=123456789,
            bc_corporate_registry_number="aaa1111111",
            business_structure='BC Corporation',
            physical_street_address="Example Physical Street Address",
            physical_municipality="Example Physical Municipality",
            physical_province="AB",
            physical_postal_code="H0H 0H0",
            mailing_street_address="Example Mailing Street Address",
            mailing_municipality="Example Mailing Municipality",
            mailing_province="BC",
            mailing_postal_code="H0H 0H0",
            mailing_address_same_as_physical=False,
            operator_has_parent_operators=True,
            parent_operators_array=[],
        )
        # need to set this outside of UserOperatorOperatorIn because otherwise the two schemas interfere with each other and one expects business_structure to be a str while the other expects BusinessStructure
        payload.parent_operators_array = [
            ParentOperatorIn(
                po_legal_name="Example Parent Legal Name",
                po_trade_name="Example Parent Trade Name",
                po_cra_business_number=987654321,
                po_bc_corporate_registry_number="bbb2222222",
                po_business_structure='BC Corporation',
                po_physical_street_address="Example Parent Physical Street Address",
                po_physical_municipality="Example Parent Physical Municipality",
                po_physical_province="BC",
                po_physical_postal_code="H0H 0H0",
                po_mailing_address_same_as_physical=False,
                mailing_street_address="Example Parent Mailing Street Address",
                po_mailing_municipality="Example Parent Mailing Municipality",
                po_mailing_province="ON",
                po_mailing_postal_code="H0H 0H0",
                operator_index=1,
            )
        ]

        UserOperatorService.save_operator(payload, operator_instance, user.user_guid)
        assert len(Operator.objects.all()) == 1
        assert Operator.objects.first().legal_name == "Example Legal Name"
        assert len(ParentOperator.objects.all()) == 1
        assert ParentOperator.objects.first().legal_name == "Example Parent Legal Name"
        assert len(Address.objects.all()) == 4
