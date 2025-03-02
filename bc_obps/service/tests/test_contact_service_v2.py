import pytest
from registration.schema import ContactFilterSchemaV2
from service.contact_service_v2 import ContactServiceV2, PlacesAssigned
from model_bakery import baker
from registration.models.business_role import BusinessRole

pytestmark = pytest.mark.django_db


class TestListContactService:
    @staticmethod
    def test_list_contacts():
        user = baker.make_recipe('registration.tests.utils.cas_admin')

        operators = baker.make_recipe('registration.tests.utils.operator', _quantity=2)

        baker.make_recipe('registration.tests.utils.contact', operator=operators[0])
        baker.make_recipe(
            'registration.tests.utils.contact', operator=operators[1], _quantity=2
        )  # one operator has two contacts

        assert (
            ContactServiceV2.list_contacts_v2(
                user_guid=user.user_guid, sort_field="created_at", sort_order="desc", filters=ContactFilterSchemaV2()
            ).count()
            == 3
        )


class TestContactService:
    @staticmethod
    def test_get_with_places_assigned_with_contacts():
        contact = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
        )
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        # add contact to operator (they have to be associated with the operator or will throw unauthorized)
        approved_user_operator.operator.contacts.set([contact])
        # add contact to operation
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        operation.contacts.set([contact])

        result = ContactServiceV2.get_with_places_assigned_v2(contact.id)
        assert result.places_assigned == [
            PlacesAssigned(
                role_name=contact.business_role.role_name, operation_name=operation.name, operation_id=operation.id
            )
        ]

    @staticmethod
    def test_get_with_places_assigned_with_no_contacts():
        contact = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
        )
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        # add contact to operator (they have to be associated with the operator or will throw unauthorized)
        approved_user_operator.operator.contacts.set([contact])

        result = ContactServiceV2.get_with_places_assigned_v2(contact.id)
        assert not hasattr(result, 'places_assigned')

    @staticmethod
    def test_raises_exception_if_contact_missing_address():
        contact = baker.make_recipe('registration.tests.utils.contact', address=None)

        with pytest.raises(
            Exception,
            match=f'The contact {contact.first_name} {contact.last_name} is missing address information. Please return to Contacts and fill in their address information before assigning them as an Operation Representative here.',
        ):
            ContactServiceV2.raise_exception_if_contact_missing_address_information(contact.id)

    @staticmethod
    def test_raises_exception_if_operation_rep_missing_required_fields():
        contacts = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
            _quantity=5,
        )
        contacts[0].address = None
        contacts[0].save()
        contacts[1].address.street_address = None
        contacts[1].address.save()
        contacts[2].address.municipality = None
        contacts[2].address.save()
        contacts[3].address.province = None
        contacts[3].address.save()
        contacts[4].address.postal_code = None
        contacts[4].address.save()

        for contact in contacts:
            with pytest.raises(
                Exception,
                match=f'The contact {contact.first_name} {contact.last_name} is missing address information. Please return to Contacts and fill in their address information before assigning them as an Operation Representative here.',
            ):
                ContactServiceV2.raise_exception_if_contact_missing_address_information(contact.id)
