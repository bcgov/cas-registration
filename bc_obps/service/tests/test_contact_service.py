import pytest
from unittest.mock import patch
from registration.schema import ContactFilterSchema, ContactIn
from service.contact_service import ContactService, PlacesAssigned
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
            ContactService.list_contacts(
                user_guid=user.user_guid, sort_field="created_at", sort_order="desc", filters=ContactFilterSchema()
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

        result = ContactService.get_with_places_assigned(approved_user_operator.user.pk, contact.id)
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

        result = ContactService.get_with_places_assigned(approved_user_operator.user.pk, contact.id)
        assert not hasattr(result, 'places_assigned')

    @staticmethod
    def test_raises_exception_if_contact_missing_address():
        contact = baker.make_recipe('registration.tests.utils.contact', address=None)

        with pytest.raises(
            Exception,
            match=f'The contact {contact.first_name} {contact.last_name} is missing address information. Please return to Contacts and fill in their address information before assigning them as an Operation Representative here.',
        ):
            ContactService.raise_exception_if_contact_missing_address_information(contact.id)

    @staticmethod
    def test_raises_exception_if_operation_rep_missing_required_fields():
        contact_with_no_address = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
            address=None,
        )

        with pytest.raises(
            Exception,
            match=f'The contact {contact_with_no_address.first_name} {contact_with_no_address.last_name} is missing address information. Please return to Contacts and fill in their address information before assigning them as an Operation Representative here.',
        ):
            ContactService.raise_exception_if_contact_missing_address_information(contact_with_no_address.id)

        address_with_no_municipality = baker.make_recipe('registration.tests.utils.address', municipality=None)
        contact_with_address_no_municipality = baker.make_recipe(
            'registration.tests.utils.contact', address=address_with_no_municipality
        )

        with pytest.raises(
            Exception,
            match=f'The contact {contact_with_address_no_municipality.first_name} {contact_with_address_no_municipality.last_name} is missing address information. Please return to Contacts and fill in their address information before assigning them as an Operation Representative here.',
        ):
            ContactService.raise_exception_if_contact_missing_address_information(
                contact_with_address_no_municipality.id
            )

    @staticmethod
    @patch("service.contact_service.ContactDataAccessService.get_by_id")
    def test_validate_operation_representative_address_scenarios(mock_get_by_id):
        # Setup: Create contacts with different roles
        op_rep_contact = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
        )
        non_op_rep_contact = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Senior Officer'),  # Not Operation Representative
        )

        # Scenario 1: Operation Representative with missing address fields
        incomplete_address_data = {
            "street_address": "123 Main St",
            "municipality": "",  # Missing municipality
            "province": "BC",
            "postal_code": "V8V 1V1",
        }
        mock_get_by_id.return_value = op_rep_contact
        with pytest.raises(
            Exception, match="This contact is an 'Operation Representative' and must have all address-related fields."
        ):
            ContactService._validate_operation_representative_address(op_rep_contact.id, incomplete_address_data)

        # Scenario 2: Operation Representative with complete address
        complete_address_data = {
            "street_address": "123 Main St",
            "municipality": "Victoria",
            "province": "BC",
            "postal_code": "V8V 1V1",
        }
        mock_get_by_id.return_value = op_rep_contact
        # No exception should be raised
        ContactService._validate_operation_representative_address(op_rep_contact.id, complete_address_data)

        # Scenario 3: Non-Operation Representative with missing address fields
        empty_address_data = {"street_address": "", "municipality": "", "province": "", "postal_code": ""}
        mock_get_by_id.return_value = non_op_rep_contact
        # No exception should be raised
        ContactService._validate_operation_representative_address(non_op_rep_contact.id, empty_address_data)


class TestUpdateContactService:
    @staticmethod
    @patch("service.contact_service.ContactService._validate_operation_representative_address")
    @patch("service.contact_service.ContactDataAccessService.user_has_access")
    def test_update_contact_successfully(mock_user_has_access, mock_validate_operation_representative_address):
        # Setup
        mock_user_has_access.return_value = True
        mock_validate_operation_representative_address.return_value = None
        user = baker.make_recipe('registration.tests.utils.cas_admin')
        contact = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
        )
        payload = ContactIn(
            first_name="Updated",
            last_name="Contact",
            email="updated@example.com",
            phone_number="+16043334444",
            position_title="Manager",
            street_address="123 Updated St",
            municipality="Updated City",
            province="BC",
            postal_code="V8V 1V1",
        )

        # Execute
        updated_contact = ContactService.update_contact(user.user_guid, contact.id, payload)

        # Assert
        mock_user_has_access.assert_called_once_with(user.user_guid, contact.id)
        mock_validate_operation_representative_address.assert_called_once_with(
            contact.id,
            {
                'street_address': '123 Updated St',
                'municipality': 'Updated City',
                'province': 'BC',
                'postal_code': 'V8V 1V1',
            },
        )
        assert updated_contact.first_name == "Updated"
        assert updated_contact.last_name == "Contact"
        assert updated_contact.email == "updated@example.com"
        assert updated_contact.address.street_address == "123 Updated St"
        assert updated_contact.address.municipality == "Updated City"

    @staticmethod
    @patch("service.contact_service.ContactService._validate_operation_representative_address")
    @patch("service.contact_service.ContactDataAccessService.user_has_access")
    def test_update_contact_remove_address(mock_user_has_access, mock_validate_operation_representative_address):
        # Setup
        mock_user_has_access.return_value = True
        mock_validate_operation_representative_address.return_value = None
        user = baker.make_recipe('registration.tests.utils.cas_admin')
        senior_officer_role = BusinessRole.objects.get(role_name='Senior Officer')
        contact = baker.make_recipe('registration.tests.utils.contact', business_role=senior_officer_role)
        payload = ContactIn(
            first_name="Updated",
            last_name="Contact",
            email="updated@example.com",
            phone_number="+16043334444",
            position_title="Manager",
            # No address data
        )

        # Execute
        # override the get method to return the senior officer role(otherwise it will return the operation representative role and the test will fail)
        with patch('registration.models.BusinessRole.objects.get', return_value=senior_officer_role) as mock_get:
            updated_contact = ContactService.update_contact(user.user_guid, contact.id, payload)

        # Assert
        assert updated_contact.first_name == "Updated"
        assert updated_contact.address is None
        mock_get.assert_called_once()
